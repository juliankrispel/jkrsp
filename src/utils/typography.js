import Typography from "typography"

const typography = new Typography({
  googleFonts: [
    {
      name: 'Roboto Slab',
      styles: [
        '700',
      ],
    },
    {
      name: 'Lato',
      styles: [
        '400',
        '400i',
        '700',
        '700i',
      ],
    },
  ],
  headerFontFamily: ['Lato'],
  bodyFontFamily: ['Lato'],
  baseFontSize: 20,
  baseLineHeight: 1.65,
})


// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
