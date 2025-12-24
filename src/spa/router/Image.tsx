import { forwardRef } from 'react'

type Props = any

const Image = forwardRef<HTMLImageElement, Props>(function ImageCompat(props, ref) {
  const { src, alt, width, height, ...rest } = props
  return (
    <img
      ref={ref}
      src={typeof src === 'string' ? src : src?.src}
      alt={alt ?? ''}
      width={width}
      height={height}
      {...rest}
    />
  )
})

export default Image
