{ pkgs ? import <nixpkgs> { } }:
with pkgs; mkShell {
  buildInputs = [
    nodejs-14_x
    python39
    gnumake
    gcc
  ];
}
