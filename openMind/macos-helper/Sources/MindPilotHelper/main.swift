import AppKit
import ApplicationServices
import CoreGraphics
import Foundation
import Network
import MindPilotCore

final class WorkspaceLauncher {
    func launchMellow(completion: @escaping (ActionResponse) -> Void) {
        let environment = ProcessInfo.processInfo.environment
        let configuredPath = environment["MINDPILOT_MELLOW_PATH"]
        let bundleURL = environment["MINDPILOT_MELLOW_BUNDLE_ID"].flatMap { NSWorkspace.shared.urlForApplication(withBundleIdentifier: $0) }
        guard let url = discoverMellow(path: configuredPath, bundleIdentifier: bundleURL?.path) else {
            completion(ActionResponse(ok: false, message: "Mellow was not found. Set MINDPILOT_MELLOW_PATH or MINDPILOT_MELLOW_BUNDLE_ID.")); return
        }
        NSWorkspace.shared.openApplication(at: url, configuration: NSWorkspace.OpenConfiguration()) { _, error in
            if let error { completion(ActionResponse(ok: false, message: "macOS could not open Mellow: \(error.localizedDescription)")) }
            else { completion(ActionResponse(ok: true, message: "Mellow launch request accepted by NSWorkspace.")) }
        }
    }

    func spotlightMellow(completion: @escaping (ActionResponse) -> Void) {
        guard AXIsProcessTrusted() else { completion(ActionResponse(ok: false, message: "Accessibility permission is required for Spotlight keyboard automation.")); return }
        postKey(code: 49, flags: .maskCommand, down: true); postKey(code: 49, flags: .maskCommand, down: false)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) {
            let text = "mellow"; let event = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true)
            event?.keyboardSetUnicodeString(stringLength: text.utf16.count, unicodeString: Array(text.utf16)); event?.post(tap: .cghidEventTap)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.55) { self.postKey(code: 36, flags: [], down: true); self.postKey(code: 36, flags: [], down: false); completion(ActionResponse(ok: true, message: "Spotlight keystrokes were posted. macOS cannot confirm which result opened.")) }
        }
    }

    private func postKey(code: CGKeyCode, flags: CGEventFlags, down: Bool) { let event = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: down); event?.flags = flags; event?.post(tap: .cghidEventTap) }
}

final class HTTPServer {
    private let listener: NWListener
    private let validator: RequestValidator
    private let launcher = WorkspaceLauncher()
    init() throws {
        let environment = ProcessInfo.processInfo.environment
        guard let token = environment["MINDPILOT_HELPER_TOKEN"], !token.isEmpty else { throw ValidationError.missingToken }
        let origins = Set((environment["MINDPILOT_ALLOWED_ORIGINS"] ?? "http://localhost:5173,http://127.0.0.1:5173").split(separator: ",").map(String.init))
        validator = RequestValidator(token: token, allowedOrigins: origins)
        listener = try NWListener(using: .tcp, on: NWEndpoint.Port(rawValue: 4817)!)
    }
    func start() { listener.stateUpdateHandler = { state in if case .failed(let error) = state { fputs("Helper listener failed: \(error)\n", stderr); exit(1) } }; listener.newConnectionHandler = { [weak self] connection in self?.handle(connection) }; listener.start(queue: .main); print("MindPilot helper listening on 127.0.0.1:4817") }
    private func handle(_ connection: NWConnection) { connection.start(queue: .main); connection.receive(minimumIncompleteLength: 1, maximumLength: 32_768) { [weak self] data, _, _, _ in guard let self, let data, let request = String(data: data, encoding: .utf8) else { return }; self.respond(to: request, on: connection) } }
    private func respond(to raw: String, on connection: NWConnection) {
        let lines = raw.components(separatedBy: "\r\n"); let origin = lines.first(where: { $0.lowercased().hasPrefix("origin:") })?.split(separator: ":", maxSplits: 1).last.map { $0.trimmingCharacters(in: .whitespaces) }; let token = lines.first(where: { $0.lowercased().hasPrefix("x-mindpilot-token:") })?.split(separator: ":", maxSplits: 1).last.map { $0.trimmingCharacters(in: .whitespaces) }; let body = raw.components(separatedBy: "\r\n\r\n").last ?? ""; let response: ActionResponse
        do { let request = try JSONDecoder().decode(ActionRequest.self, from: Data(body.utf8)); let action = try validator.validate(request: request, suppliedToken: token, origin: origin); switch action { case .launchMellow: launcher.launchMellow { self.send($0, on: connection) }; case .spotlightMellow: launcher.spotlightMellow { self.send($0, on: connection) } }; return } catch { response = ActionResponse(ok: false, message: "Rejected request: \(error)") }
        send(response, on: connection)
    }
    private func send(_ response: ActionResponse, on connection: NWConnection) { let body = (try? JSONEncoder().encode(response)) ?? Data(); let header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: http://localhost:5173\r\nContent-Length: \(body.count)\r\nConnection: close\r\n\r\n"; connection.send(content: Data(header.utf8) + body, completion: .contentProcessed { _ in connection.cancel() }) }
}

do { let server = try HTTPServer(); server.start(); dispatchMain() } catch { fputs("Could not start helper: \(error)\nSet MINDPILOT_HELPER_TOKEN before launching.\n", stderr); exit(1) }
