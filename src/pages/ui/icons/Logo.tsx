import Image from 'next/image'

export default function LogoIcon({logo}:{logo?:string}) {

  return (
   <Image
     src={logo || '/logo.svg'}
     alt='Logo'
     width={50 }
     height={50}
   />
  )
}
