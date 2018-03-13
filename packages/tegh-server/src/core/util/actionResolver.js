const actionResolver = ({
  actionCreator,
}) => (_source, args, { store }) => {
  const state = store.getState()
  if (args.printerID !== state.config.id) {
    throw new Error(`Printer ID ${args.printerID} does not exist`)
  }
  const action = actionCreator(args)
  store.dispatch(action)
}

export actionResolver
