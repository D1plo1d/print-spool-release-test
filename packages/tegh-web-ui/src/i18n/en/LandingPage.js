import deline from 'deline'

const LandingPageEN = {
  hero: {
    // title: '3D Printing. Simplified.',
    // subtitle: 'Tegh is your all new streamlined 3D printing experience',
    title: 'A bold new way to 3D print over WiFi.',
    callToActionButton: 'Get Started',
  },
  introduction: {
    title: 'Worry Less. Create <1>More</1>.',
    content: deline`
      3D printing is a powerful tool for prototyping and designing new things but managing 3D prints can take up valuable time and energy.\n

      Tegh is designed from the ground up to streamline your WiFi 3D printing experience. Re-imagining the 3D printer workflow to remove print management obstacles so you can worry less and create more.\n

      Tegh is and will always be free software.
    `,
  },
  printQueueing: {
    title: 'Print Queueing',
    content: deline`
    Printing multiple parts should be easy. With Tegh when you click print your part is added to a queue - it's like a playlist for your 3D printer.\n

    Once you've cleared the build platform Tegh's play button is there for you to start up your next print in the queue - no looking up file names or trying to remember what part was supposed to be next. Printing is always simple, no matter how many parts you have to print.
    `
  },
  fullyAutomatic: {
    title: 'Fully Automatic',
    content: deline`
      Removing each print by hand takes time and it can be a frustrating interuption to your work. Tegh automates removing prints.\n

      In Automatic Printing mode Tegh will automatically start, stop and remove each print from your queue for you.\n

      If you have the hardware to support automatically ejecting prints all you have to do is add your designs to the queue and Tegh will automatically print piles of parts for you.
    `
  },
  features: {
    title: 'And More',
    printQueueing: deline`
      ## Simple\n

      Print parts now or queue them up for later with Tegh's easy to use print queue.
    `,
    easySetup: deline`
      ## Easy to Setup\n

      No python scripts to run. No SD Cards to flash. No static IPs to route. Just [install the snap](https://snapcraft.io/tegh) and [get started](#/get-started/).
    `,
    secure: deline`
      ## Secure\n

      Protect your prints with the worlds first end-to-end encrypted 3D printing software.
    `,
    automatic: deline`
      ## Automatic\n

      Sit back and relax while Tegh uses your [Autodrop auto-scraper](https://www.autodrop3d.com/) to fully automatically print and eject piles of parts.
    `,
    multiPrinter: deline`
      ## Multi-Printer\n

      Access all of your 3D printers from one convenient dashboard.
    `,
    openSource: deline`
      ## 100% Open Source\n

      Tegh is and will always be free. Tegh is open source software under the Affero General Public License (AGPL).
    `,
  },
  contribute: {
    title: 'Help Tegh Grow',
    content: deline`
    There are many ways to help Tegh!

    #### Translations

    #### Bug Reports

    #### Pull Requests

    #### Donations
    `,
    kofiButton: 'Support Me on Ko-fi',
    cryptoDonationButton: 'Donate {{shortName}}',
    cryptoAddressCopied: 'We copied Tegh\'s {{shortName}} address to your clipboard. Thanks for supporting Tegh!',
    cryptoDonationDialogTitle: 'Thank you for supporting Tegh!',
    cryptoDonationDialogContent: 'You can use the {{longName}} address below to donate to Tegh\'s development',
  },
  footer: {
    connectTitle: 'Connect with us at'
  },
}

export default LandingPageEN
