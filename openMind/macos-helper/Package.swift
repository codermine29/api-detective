// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MindPilotHelper",
    platforms: [.macOS(.v13)],
    products: [.executable(name: "mindpilot-helper", targets: ["MindPilotHelper"])],
    targets: [
        .target(name: "MindPilotCore"),
        .executableTarget(name: "MindPilotHelper", dependencies: ["MindPilotCore"]),
        .testTarget(name: "MindPilotCoreTests", dependencies: ["MindPilotCore"]),
    ]
)
