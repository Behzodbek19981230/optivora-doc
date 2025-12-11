// ** React Imports
import { ReactNode } from 'react'

// ** MUI Components
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Demo Components Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'
import RegisterMultiStepsWizard from 'src/views/pages/auth/register-multi-steps'
import LogoIcon from 'src/pages/ui/icons/Logo'

// ** Styled Components
const RegisterMultiStepsIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 550,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12)
}))

const LeftWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12),
  '& .img-mask': {
    left: 0
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 470
  }
}))

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(12)
  }
}))

const RegisterMultiSteps = () => {
  // ** Hooks
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))

  return (
    <Box className='content-right' sx={{ backgroundColor: 'customColors.bodyBg' }}>
      {!hidden ? (
        <LeftWrapper>
          <Box sx={{ top: 26, left: 26, display: 'flex', position: 'absolute', alignItems: 'center' }}>
            <LogoIcon />
            <Typography sx={{ ml: 2.5, fontWeight: 600, lineHeight: '24px', fontSize: '1.375rem' }}>
              {themeConfig.templateName}
            </Typography>
          </Box>
          <RegisterMultiStepsIllustration
            alt='register-multi-steps-illustration'
            src='/images/pages/auth-v2-register-multi-steps-illustration.png'
          />
          <FooterIllustrationsV2
            height={350}
            className='img-mask'
            image={`/images/pages/auth-v2-register-multi-steps-mask-${theme.palette.mode}.png`}
          />
        </LeftWrapper>
      ) : null}
      <RightWrapper>
        <Box sx={{ maxWidth: 700 }}>
          <RegisterMultiStepsWizard />
        </Box>
      </RightWrapper>
    </Box>
  )
}

RegisterMultiSteps.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default RegisterMultiSteps
