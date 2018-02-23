import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

import { isIdle } from '../../core/spool/reducers/spoolReducer.js'

import PrinterStatusEnum from './PrinterStatusEnum.graphql.js'
import HeaterType from './Heater.graphql.js'
import FanType from './Fan.graphql.js'
import LogEntryType from '../../log/types/LogEntry.graphql.js'
import MacroDefinitionType from '../../macros/types/MacroDefinition.graphql.js'
import PrinterErrorType from './PrinterError.graphql.js'

const Printer = new GraphQLObjectType({
  name: 'Printer',
  fields: () => ({
    id: {
      type: tql`ID!`,
      resolve(source) {
        return source.config.id
      },
    },
    name: {
      type: tql`String!`,
      resolve(source) {
        return source.config.name
      },
    },
    heaters: {
      type: tql`[${HeaterType}!]!`,
      resolve(source) {
        return Object.values(source.driver.heaters)
      },
    },
    targetTemperaturesCountdown: {
      type: tql`Float`,
      description: snl`
        The estimated number of seconds until the heater(s) reach their
        targetTemperature.
      `,
      resolve(source) {
        return source.driver.targetTemperaturesCountdown
      },
    },
    fans: {
      type: tql`[${FanType}!]!`,
      resolve(source) {
        return Object.values(source.driver.fans)
      },
    },
    status: {
      type: tql`${PrinterStatusEnum}!`,
      resolve(source) {
        return source.driver.status.toUpperCase()
      },
    },
    isIdle: {
      type: tql`Boolean!`
      description: snl`
        Returns true if the machine is able to accept new tasks (eg. manual
        movements + control). Running a job sets idle to false. If the printer's
        status is not \`"ready"\` then idle is false.
      `,
      resolve(source, _args, { store }) {
        const state = store.getState()
        return isIdle(state.spool) && source.driver.status === 'ready'
      }
    }
    error: {
      type: tql`${PrinterErrorType}`,
      resolve(source) {
        return source.driver.error
      },
    },
    macroDefinitions: {
      type: tql`[${MacroDefinitionType}!]!`,
      resolve: (_source, _args, context) => {
        return Object.values(context.store.getState().macros)
      },
    },
    logEntries: {
      type: tql`[${LogEntryType}!]`,
      args: {
        level: {
          type: tql`String`,
        },
        source: {
          type: tql`String`,
        },
      },
      resolve(source, args) {
        let entries = source.log.get('entries')
        if (args.level != null) {
          entries = entries.filter(log => log.level == args.level)
        }
        if (args.source != null) {
          entries = entries.filter(log => log.source == args.source)
        }
        return entries.toArray()
      },
    },
  })
})

export default Printer
