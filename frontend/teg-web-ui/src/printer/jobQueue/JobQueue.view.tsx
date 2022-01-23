import React, { useState, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import truncate from 'truncate'

import Typography from '@mui/material/Typography'
// import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

import Add from '@mui/icons-material/Add'
import PlayArrow from '@mui/icons-material/PlayArrow'
import CloudUpload from '@mui/icons-material/CloudUpload'
import LowPriorityIcon from '@mui/icons-material/LowPriority'
import Star from '@mui/icons-material/Star'
import StarOutline from '@mui/icons-material/StarOutline'

import useConfirm from '../../common/_hooks/useConfirm'
import FileInput from '../../common/FileInput'
// import FloatingPrintNextButton from './components/FloatingPrintNextButton'
import useStyles from './JobQueue.styles'
import PrintPage from '../print/Print.page'
import { allFileExtensions } from '../print/Print.view'
import PrintCard from './components/PrintCard'
import ServerBreadcrumbs from '../common/ServerBreadcrumbs'

const JobQueueView = ({
  latestPrints,
  printQueues,
  machines,
  nextPart,
  print,
  printNext,
  printMutation,
  deleteParts,
  cancelTask,
  pausePrint,
  resumePrint,
  setPartPositions,
  setStarred,
  history,
  openPrintPage,
}) => {
  const classes = useStyles()
  const { machineID } = useParams()

  // console.log({ printQueues })
  const parts = printQueues.map(q => q.parts).flat()

  const statuses = machines.map(machine => machine.status)
  const disablePrintNextButton = (
    nextPart == null
    || !statuses.includes('READY')
    || printMutation.loading
  )

  // const [printDialogFiles, setPrintDialogFiles] = useState()
  const [isDragging, setDragging] = useState(false)

  const defaultValues = () => ({
    selectedParts: Object.fromEntries(parts.map(part => ([
      part.id,
      false,
    ])))
  })

  const {
    // register,
    watch,
    reset,
    control,
    getValues,
    // setValue,
  } = useForm({
    defaultValues: defaultValues(),
  })

  const selectedPartsObj = watch('selectedParts', {})
  const selectedParts = Object.entries(selectedPartsObj)
    .filter(([, v]) => v)
    .map(([k]) => k)

  // console.log(selectedParts)

  const resetSelection = () => {
    // console.log('reset selected parts')
    reset({
      ...getValues(),
      selectedParts: defaultValues().selectedParts,
    })
  }

  const onSelectAllClick = (e) => {
    if (e.target.checked && selectedParts.length === 0) {
      reset({
        ...getValues(),
        selectedParts: Object.fromEntries(parts.map(part => [part.id, true])),
      })
    } else {
      resetSelection()
    }
  }

  const confirm = useConfirm()
  const confirmedDeleteParts = confirm(() => ({
    fn: async () => {
      await deleteParts({
        variables: {
          input: {
            partIDs: selectedParts,
          },
        },
      })
      resetSelection()
    },
    title: (
      'Are you sure you want to remove '
      + (selectedParts.length > 1 ? `these ${selectedParts.length} parts` : 'this part')
      + ` from the queue?`
    ),
    description: (
      <>
        { selectedParts.map(id => (
          <React.Fragment key={id}>
            {parts.find(p => p.id == id).name}
            <br/>
          </React.Fragment>
        ))}
      </>
    )
  }))

  const moveToTopOfQueue = () => {
    setPartPositions({
      variables: {
        input: {
          // Use the parts list so that they are ordered by their current position.
          // This matters for bulk moves - without this the order within the moved parts would
          // not be consistent with their previous visual order.
          parts: parts
            .filter(part => selectedPartsObj[part.id])
            .map((part, index) => ({
              partID: part.id,
              position: index,
            })),
        },
      },
    })
  }

  const onDragOver = useCallback((ev) => {
    setDragging(true)

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()
  }, [])

  const onDragLeave = useCallback((ev) => {
    setDragging(false)
  }, [])

  const onDrop = useCallback((ev) => {
    setDragging(false)

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()

    let files
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      files = [...ev.dataTransfer.items]
        .map((item) => item.getAsFile())
        .filter(item => item != null)
    } else {
      files = [...ev.dataTransfer.files]
    }

    if (files.length > 0) {
      openPrintPage({ files })
    }
  }, [])

  // console.log({ isDragging })
  // console.log(selectedParts.length)

  let printButtonTooltip = ''
  if (nextPart == null) {
    printButtonTooltip = 'Cannot print if print queue is empty'
  } else if (!statuses.includes('READY')) {
    printButtonTooltip = `Cannot print when machine is ${statuses[0].toLowerCase()}`
  } else if (printMutation.loading) {
    printButtonTooltip = "Starting print..."
  } else if (selectedParts.length > 1) {
    printButtonTooltip = "Cannot print more then 1 part at a time"
  }

  return (
    <div
      className={classes.root}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <ServerBreadcrumbs>
        <Typography color="textPrimary">{machines[0].name}</Typography>
      </ServerBreadcrumbs>

      <div className={latestPrints.length > 0 ? classes.latestPrints : null}>
        {/* <Typography variant="subtitle1" gutterBottom>
          Latest Print
        </Typography> */}
        { latestPrints.map(latestPrint => (
          <PrintCard {...{
            key: latestPrint.id,
            print: latestPrint,
            cancelTask,
            pausePrint,
            resumePrint,
            deleteParts,
            retryPrint: () => print({ id: latestPrint.part.id }),
            retryPrintMutation: printMutation,
          }} />
        ))}
      </div>

      {/* Actions Row */}
      <div className={classes.actionsRow}>
        <Button
          component="label"
          variant="outlined"
          className={classes.actionsRowButton}
          startIcon={<Add/>}>
          <FileInput
            accept={allFileExtensions}
            multiple
            onClick={(files) => openPrintPage({ files })}
          />
          Add
        </Button>
        <Tooltip title={printButtonTooltip}>
          <Button
            style={{
              pointerEvents: "auto",
            }}
            component="div"
            variant="contained"
            className={classes.actionsRowButton}
            disabled={disablePrintNextButton || selectedParts.length > 1}
            onClick={() => {
              if (selectedParts.length === 1) {
                print({ id: selectedParts[0] })
              } else {
                printNext()
              }
            }}
            startIcon={<PlayArrow/>}
          >
            {`Print ${selectedParts.length > 0 ? `Selected (${selectedParts.length})` : 'Next'}`}
          </Button>
        </Tooltip>
      </div>

      <div
        className={[
          (isDragging || parts.length === 0) ? classes.draggingOrEmpty : '',
          isDragging ? classes.dragging : '',
        ].join(' ')}
      >
        { (isDragging || parts.length === 0) && (
          <div className={classes.dragArea}>
            {/* <CloudUpload className={classes.dragIcon} /> */}
            <label
              className={classes.dragLabel}
            >
              <CloudUpload className={classes.dragIcon}/>
              <Typography
                variant="h6"
                className={classes.dragText}
                component="div"
              >
                {!isDragging && (
                  <>
                    Your print queue is empty. Drag and drop a gcode file here to get started!
                    <FileInput
                      accept={allFileExtensions}
                      multiple
                      onClick={(files) => openPrintPage({ files })}
                    />
                  </>
                )}
                {isDragging && (
                  'Drop your gcode file here!'
                )}
              </Typography>
              {/* <Typography
                variant="h6"
                component="div"
                // className={classes.dragText}
                paragraph
              >
                Or
              </Typography>
              <Button
                className={classes.chooseAFileButton}
                component="label"
                variant="contained"
                color="primary"
              >
                Select Files
                <FileInput
                  accept=".ngc,.gcode"
                  onClick={setPrintDialogFiles}
                />
              </Button> */}
            </label>
          </div>
        )}

        { !isDragging && printQueues.filter(q => q.parts.length > 0).map(printQueue => (
            <Paper key={printQueue.id}>
              <div className={classes.partsList}>
                <TableContainer>
                  <Table
                    size="medium"
                    aria-label={ printQueue.name }
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" className={classes.headerCheckbox}>
                          <Checkbox
                            indeterminate={
                              selectedParts.length > 0
                              && selectedParts.length < parts.length
                            }
                            checked={
                              selectedParts.length > 0
                              && selectedParts.length === parts.length
                            }
                            onChange={onSelectAllClick}
                            inputProps={{ 'aria-label': 'select all parts' }}
                          />
                        </TableCell>
                        <TableCell padding="none" colSpan={2}>
                          { selectedParts.length > 0 && (
                            <>
                              {/* <Tooltip title="Print Selected">
                                <IconButton
                                  aria-label="print-selected"
                                  onClick={() => {
                                    print({ id: selectedParts[0] })
                                  }}
                                  edge="start"
                                  disabled={ disablePrintNextButton || selectedParts.length !== 1}
                                >
                                  <PlayArrow />
                                </IconButton>
                              </Tooltip> */}
                              <Tooltip title="Move to Top of Queue">
                                <IconButton
                                  aria-label="move to top of queue"
                                  onClick={moveToTopOfQueue}
                                  edge="start"
                                  style={{ transform: 'scaleX(-1) scaleY(-1)' }}
                                  size="large">
                                  <LowPriorityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  aria-label="delete"
                                  onClick={confirmedDeleteParts}
                                  edge="start"
                                  size="large">
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography
                            variant="h5"
                            component="div"
                          >
                            { printQueue.name }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        printQueue.parts.map(part => {
                          const labelID = `${part.id}-label`
                          const shortName = truncate(part.name, 32)

                          return (
                            <Controller
                              key={part.id}
                              name={`selectedParts.${part.id}`}
                              control={control}
                              defaultValue={false}
                              render={(checkboxProps) => (
                                <TableRow
                                  hover
                                  // onClick={(event) => handleClick(event, row.name)}
                                  // role="checkbox"
                                  // aria-checked={isItemSelected}
                                  tabIndex={-1}
                                  onClick={() => {
                                    history.push(`./printing/${part.id}/`)
                                  }}
                                  selected={checkboxProps.value}
                                  style={{ cursor: 'pointer' }}
                                  // selected={isItemSelected}
                                >
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={checkboxProps.value || false}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                      }}
                                      onChange={(e) => {
                                        // console.log('on change', selectedPartsObj)
                                        // @ts-ignore
                                        checkboxProps.onChange(e.target.checked)
                                      }}
                                      // size="small"
                                      // inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                  </TableCell>
                                  <TableCell padding="checkbox" className={classes.savedCell}>
                                    <IconButton
                                      aria-label={part.starred ? 'Unsave' : 'Save'}
                                      edge="start"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        console.log({
                                          variables: {
                                            input: {
                                              packageID: part.packageID,
                                              starred: !part.starred,
                                            },
                                          },
                                        })
                                        setStarred({
                                          variables: {
                                            input: {
                                              packageID: part.packageID,
                                              starred: !part.starred,
                                            },
                                          },
                                        })
                                      }}
                                      size="large">
                                      { part.starred && (
                                        <Star className={classes.savedStar} />
                                      )}
                                      { !part.starred && (
                                        <StarOutline className={classes.UnsavedStarOutline} />
                                      )}
                                    </IconButton>
                                  </TableCell>
                                  <TableCell
                                    component="th"
                                    id={labelID}
                                    scope="row"
                                    padding="none"
                                  >
                                    <Typography display="inline">
                                      {shortName}
                                    </Typography>
                                    <Typography
                                      display="inline"
                                      className={classes.qty}
                                    >
                                      {`${part.printsCompleted} / ${part.totalPrints} `}
                                      printed
                                    </Typography>
                                    { part.printsInProgress > 0 && (
                                      <Typography color="primary" display="inline">
                                        {`${part.printsInProgress} printing`}
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                            />
                          );
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </Paper>
        ))}
      </div>

      {/* <MobileButtons /> */}
    </div>
  );
}

// const MobileButtons = (
//   <>
//     {/* Add Job Button */}
//     <Tooltip title="Add Job" placement="left">
//       <Fab
//         component="label"
//         variant="extended"
//         className={classes.addJobFab}
//         color="default"
//       >
//         <FileInput
//           accept=".ngc,.gcode"
//           onClick={setPrintDialogFiles}
//         />
//         <Add className={ classes.fabIconExtended }/>
//         Add
//       </Fab>
//     </Tooltip>
//     {/* Print Next Button */}
//     <FloatingPrintNextButton
//       disabled={disablePrintNextButton}
//       onClick={printNext}
//     />
//   </>
// )

export default JobQueueView
