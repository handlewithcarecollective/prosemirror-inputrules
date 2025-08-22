{ pkgs, lib, config, inputs, ... }:

{
  packages = [ pkgs.nil ];
  # https://devenv.sh/languages/
  # languages.rust.enable = true;
  languages.javascript = {
    enable = true;
    corepack.enable = true;
  };
}
