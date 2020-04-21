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
  headerFontFamily: ['Roboto Slab'],
  bodyFontFamily: ['Lato'],
  baseFontSize: 18,
  baseLineHeight: 1.6,
})


// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
