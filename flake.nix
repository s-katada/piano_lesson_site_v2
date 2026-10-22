{
    description = "Piano Lesson Site";

    inputs = {
        # Node 26.12.1（2026-10-21 のセキュリティリリース）を含む master のコミットに固定。
        # nixpkgs-unstable が追いついたら "github:NixOS/nixpkgs/nixpkgs-unstable" に戻す。
        nixpkgs.url = "github:NixOS/nixpkgs/13aacc037030987355eb6cc77daf49c6a0d63118";
        flake-utils.url = "github:numtide/flake-utils";
    };

    outputs = { self, nixpkgs, flake-utils}:
      flake-utils.lib.eachDefaultSystem (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in {
            devShells.default = pkgs.mkShell {
                packages = [
                    pkgs.bun
                    pkgs.nodejs_26
                    pkgs.cowsay
                ];
            };
        }
      );
}