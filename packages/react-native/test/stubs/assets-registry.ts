// react-native-svg's web build reads bundled image assets from Metro's registry; the
// tests draw no <Image> asset, so the registry is empty.
export function getAssetByID(): undefined {
  return undefined;
}
