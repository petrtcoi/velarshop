import { computed } from "nanostores"
import { persistentAtom } from "@nanostores/persistent"
import { columnConnections } from "@entities/RadiatorConnection"

const version = await import.meta.env.PUBLIC_LOCAL_STORAGE_VERSION

const columnConnIdBackup = persistentAtom<string>(
  `velarshop_column_radiator_connection_backup/${version}`,
  ""
)
const columnConnId = persistentAtom<string>(
  `velarshop_column_radiator_connection_active/${version}`,
  ""
)

const columnConn = computed(columnConnId, connId => {
  if (!connId) return null
  const connection = columnConnections.find(r => r.id === connId)
  if (!connection) return null
  return connection
})

const columnConnPostfix = computed(columnConn, connection => {
  if (!connection) return ""
  return `, ${connection.code.toLowerCase()}`
})

export { columnConnId, columnConn, columnConnPostfix, columnConnIdBackup }
