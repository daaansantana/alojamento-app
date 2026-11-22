/** The vertical nexo logo, for the screens with room for it. The header already names the app, so it is decorative here. */
export function LogoVertical() {
  return (
    // biome-ignore lint/performance/noImgElement: a static SVG, served as it is
    <img
      src="/marca/logo-vertical.svg"
      alt=""
      width={128}
      height={96}
      className="mx-auto h-24 w-auto"
    />
  );
}
