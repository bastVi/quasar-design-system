/**
 * Quasar icon-set using Phosphor LINE (regular) icons from quasar-extras-svg-icons.
 *
 * Internal control icons (QSelect arrow, QChip close, pagination, expansion chevrons, etc.)
 * use Phosphor "regular" (line) weight — NOT duotone, which collapses at 16–18px.
 *
 * Content / feature icons (app-level): use @phosphor-icons/vue with weight="duotone"
 *   e.g. <PhBell weight="duotone" size="1.25em" color="currentColor" />
 */

import {
  ppArrowDown,
  ppArrowLeft,
  ppArrowRight,
  ppArrowUp,
  ppArrowClockwise,
  ppArrowCounterClockwise,
  ppCaretDown,
  ppCaretLeft,
  ppCaretRight,
  ppCaretDoubleLeft,
  ppCaretDoubleRight,
  ppCheckCircle,
  ppCheck,
  ppCheckSquare,
  ppXCircle,
  ppX,
  ppWarning,
  ppInfo,
  ppPlus,
  ppPencil,
  ppPalette,
  ppSliders,
  ppDotOutline,
  ppEyedropper,
  ppStar,
  ppCaretUp,
  ppCloudArrowUp,
  ppTrash,
  ppListBullets,
  ppListNumbers,
  ppTextB,
  ppTextItalic,
  ppTextUnderline,
  ppTextStrikethrough,
  ppTextSubscript,
  ppTextSuperscript,
  ppTextIndent,
  ppTextOutdent,
  ppLink,
  ppArrowsOut,
  ppQuotes,
  ppAlignLeft,
  ppAlignRight,
  ppAlignCenterHorizontal,
  ppTextAlignJustify,
  ppCode,
  ppTextAa,
  ppMinus,
  ppPrinter,
  ppPlay,
  ppCalendarBlank,
  ppClock,
} from 'quasar-extras-svg-icons/phosphor-icons-v2'

// Mapped Quasar icon keys (all sections exhaustively covered):
//   type.{positive,negative,info,warning}
//   arrow.{up,right,down,left,dropdown}
//   chevron.{left,right}
//   colorPicker.{spectrum,tune,palette}
//   pullToRefresh.icon
//   carousel.{left,right,up,down,navigationIcon}
//   chip.{remove,selected}
//   datetime.{arrowLeft,arrowRight,now,today}
//   editor.{bold,italic,strikethrough,underline,unorderedList,orderedList,
//           subscript,superscript,hyperlink,toggleFullscreen,quote,left,center,
//           right,justify,print,outdent,indent,removeFormat,formatting,fontSize,
//           align,hr,undo,redo,heading,code,size,font,viewSource}
//   expansionItem.{icon,denseIcon}
//   fab.{icon,activeIcon}
//   field.{clear,error}
//   pagination.{first,prev,next,last}
//   rating.icon
//   stepper.{done,active,error}
//   tabs.{left,right,up,down}
//   table.{arrowUp,warning,firstPage,prevPage,nextPage,lastPage}
//   tree.icon
//   uploader.{done,clear,add,upload,removeQueue,removeUploaded}
//
// Approximations: editor.{undo,redo} — ppArrowCounterClockwise / ppArrowClockwise (standard mapping).
//   editor.{hr,font,size,heading,fontSize,formatting,removeFormat} use the closest
//   semantic matches (ppMinus / ppTextAa / ppX) where Phosphor has no exact glyph.

const qdsIconSet = {
  name: 'qds-phosphor',

  type: {
    positive: ppCheckCircle,
    negative: ppWarning,
    info: ppInfo,
    warning: ppWarning,
  },

  arrow: {
    up: ppArrowUp,
    right: ppArrowRight,
    down: ppArrowDown,
    left: ppArrowLeft,
    dropdown: ppCaretDown,
  },

  chevron: {
    left: ppCaretLeft,
    right: ppCaretRight,
  },

  colorPicker: {
    spectrum: ppEyedropper,
    tune: ppSliders,
    palette: ppPalette,
  },

  pullToRefresh: {
    icon: ppArrowClockwise,
  },

  carousel: {
    left: ppCaretLeft,
    right: ppCaretRight,
    up: ppCaretUp,
    down: ppCaretDown,
    navigationIcon: ppDotOutline,
  },

  chip: {
    remove: ppX,
    selected: ppCheck,
  },

  datetime: {
    arrowLeft: ppCaretLeft,
    arrowRight: ppCaretRight,
    now: ppClock,
    today: ppCalendarBlank,
  },

  editor: {
    bold: ppTextB,
    italic: ppTextItalic,
    strikethrough: ppTextStrikethrough,
    underline: ppTextUnderline,
    unorderedList: ppListBullets,
    orderedList: ppListNumbers,
    subscript: ppTextSubscript,
    superscript: ppTextSuperscript,
    hyperlink: ppLink,
    toggleFullscreen: ppArrowsOut,
    quote: ppQuotes,
    left: ppAlignLeft,
    center: ppAlignCenterHorizontal,
    right: ppAlignRight,
    justify: ppTextAlignJustify,
    print: ppPrinter,
    outdent: ppTextOutdent,
    indent: ppTextIndent,
    removeFormat: ppX,
    formatting: ppTextAa,
    fontSize: ppTextAa,
    align: ppAlignLeft,
    hr: ppMinus,
    undo: ppArrowCounterClockwise,
    redo: ppArrowClockwise,
    heading: ppTextAa,
    code: ppCode,
    size: ppTextAa,
    font: ppTextAa,
    viewSource: ppCode,
  },

  expansionItem: {
    icon: ppCaretDown,
    denseIcon: ppCaretDown,
  },

  fab: {
    icon: ppPlus,
    activeIcon: ppX,
  },

  field: {
    clear: ppX,
    error: ppWarning,
  },

  pagination: {
    first: ppCaretDoubleLeft,
    prev: ppCaretLeft,
    next: ppCaretRight,
    last: ppCaretDoubleRight,
  },

  rating: {
    icon: ppStar,
  },

  stepper: {
    done: ppCheck,
    active: ppPencil,
    error: ppWarning,
  },

  tabs: {
    left: ppCaretLeft,
    right: ppCaretRight,
    up: ppCaretUp,
    down: ppCaretDown,
  },

  table: {
    arrowUp: ppArrowUp,
    warning: ppWarning,
    firstPage: ppCaretDoubleLeft,
    prevPage: ppCaretLeft,
    nextPage: ppCaretRight,
    lastPage: ppCaretDoubleRight,
  },

  tree: {
    icon: ppPlay,
  },

  uploader: {
    done: ppCheck,
    clear: ppX,
    add: ppPlus,
    upload: ppCloudArrowUp,
    removeQueue: ppTrash,
    removeUploaded: ppCheckSquare,
  },
} as const

export type QdsIconSet = typeof qdsIconSet
export { qdsIconSet }
export default qdsIconSet
