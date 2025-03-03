import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Hidden from '@material-ui/core/Hidden'

// // eslint-disable-next-line import/no-unresolved
// import cubesSVG from 'url:./images/cubes.svg'
// // eslint-disable-next-line import/no-unresolved
// import cubesMobileSVG from 'url:./images/cubesMobile.svg'
// // eslint-disable-next-line import/no-unresolved
// import tegLogoSVG from 'url:./images/tegLogo.svg'

import HeroStyles from './HeroStyles'

const Hero = ({ t }) => {
  const classes = HeroStyles()

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <div className={classes.wordmark}>
          <span style={{ fontWeight: 'lighter' }}>Print</span>
          <span>Spool</span>
        </div>
        <div className={classes.topButtons}>
          <Button
            className={classes.topButton}
            component="a"
            href="https://github.com/tegapp/teg"
          >
            Github
          </Button>
          <Button
            className={classes.topButton}
            variant="outlined"
            component={React.forwardRef((props, ref) => (
              <Link to="/login" innerRef={ref} {...props} />
            ))}
          >
            Log in
          </Button>
        </div>
      </div>
      <div className={classes.centeredContent}>
        <div>
          <Typography
            variant="body1"
            component="div"
            className={classes.taglinePart1}
          >
            {t('hero.title')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            className={classes.callToActionButton}
            component={React.forwardRef((props, ref) => (
              // eslint-disable-next-line
              <a
                href="https://f39c45f8.sibforms.com/serve/MUIEAE-_A4uUHTi1cRelH4oP-Fi21skRjdhqT4Bqd6PTwzyx7w-HnThYJlxGsbdxMQhtyFPhivfG60tOvTWmQL5P3eDxDzZHCh_G6JN0VdspzLX4ZgZzTm3XdfobEG6UCE4LkzTzLUQlPvL9HaSe5IWfaTyuG5RyZ2WJYvkxmHe-xTQ4ugNxkuPPf0l8PacyYVdkhZME24181ayK"
                ref={ref}
                {...props}
              />
              // <Link to="/get-started/" innerRef={ref} {...props} />
            ))}
          >
            {t('hero.callToActionButton')}
          </Button>
        </div>
      </div>
{/*
      <Hidden smUp>
        <img
          alt=""
          src={cubesMobileSVG}
          className={classes.cubes}
        />
      </Hidden>
      <Hidden xsDown>
        <div className={classes.cubes}>
          <img
            alt=""
            src={cubesSVG}
            className={classes.firstInnerCubes}
          />
          <Hidden mdDown>
            <img
              alt=""
              src={cubesMobileSVG}
              className={classes.secondInnerCubes}
            />
          </Hidden>
        </div>
      </Hidden> */}
    </div>
  )
}

export default Hero
