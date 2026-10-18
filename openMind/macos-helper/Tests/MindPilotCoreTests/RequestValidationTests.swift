import XCTest
@testable import MindPilotCore

final class RequestValidationTests: XCTestCase {
    let validator = RequestValidator(token: "secret", allowedOrigins: ["http://localhost:5173"])
    func testAllowsDocumentedActions() throws { XCTAssertEqual(try validator.validate(request: ActionRequest(action: "launch-mellow"), suppliedToken: "secret", origin: "http://localhost:5173"), .launchMellow) }
    func testRejectsUnknownAction() { XCTAssertThrowsError(try validator.validate(request: ActionRequest(action: "run-shell"), suppliedToken: "secret", origin: "http://localhost:5173")) }
    func testRejectsBadTokenAndOrigin() { XCTAssertThrowsError(try validator.validate(request: ActionRequest(action: "launch-mellow"), suppliedToken: "wrong", origin: "http://localhost:5173")); XCTAssertThrowsError(try validator.validate(request: ActionRequest(action: "launch-mellow"), suppliedToken: "secret", origin: "https://evil.example")) }
    func testMissingMellowIsSafe() { XCTAssertNil(discoverMellow(path: "/definitely/missing/Mellow.app", bundleIdentifier: nil)) }
}
