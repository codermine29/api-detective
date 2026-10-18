import Foundation

public enum NativeAction: String, Codable, CaseIterable {
    case launchMellow = "launch-mellow"
    case spotlightMellow = "spotlight-mellow"
}

public struct ActionRequest: Codable, Equatable {
    public let action: String
    public init(action: String) { self.action = action }
}

public struct ActionResponse: Codable, Equatable {
    public let ok: Bool
    public let message: String
    public init(ok: Bool, message: String) { self.ok = ok; self.message = message }
}

public enum ValidationError: Error, Equatable { case malformedRequest, unknownAction, missingToken, invalidOrigin }

public struct RequestValidator {
    public let token: String
    public let allowedOrigins: Set<String>
    public init(token: String, allowedOrigins: Set<String>) { self.token = token; self.allowedOrigins = allowedOrigins }
    public func validate(request: ActionRequest, suppliedToken: String?, origin: String?) throws -> NativeAction {
        guard let suppliedToken, !token.isEmpty, suppliedToken == token else { throw ValidationError.missingToken }
        guard let origin, allowedOrigins.contains(origin) else { throw ValidationError.invalidOrigin }
        guard let action = NativeAction(rawValue: request.action) else { throw ValidationError.unknownAction }
        return action
    }
}

public func discoverMellow(path: String?, bundleIdentifier: String?) -> URL? {
    let fileManager = FileManager.default
    if let path, fileManager.fileExists(atPath: path) { return URL(fileURLWithPath: path) }
    // Bundle-ID lookup is performed by the AppKit executable target.
    _ = bundleIdentifier
    let defaultURL = URL(fileURLWithPath: "/Applications/Mellow.app")
    return fileManager.fileExists(atPath: defaultURL.path) ? defaultURL : nil
}
