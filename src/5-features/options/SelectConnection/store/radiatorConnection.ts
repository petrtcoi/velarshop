import { computed } from 'nanostores'
import { persistentAtom } from "@nanostores/persistent"
import { radiatorConnections } from "@entities/RadiatorConnection"

const version = await import.meta.env.PUBLIC_LOCAL_STORAGE_VERSION


const radiatorConnIdBackup = persistentAtom<string>(`velarshop_radiator_connection_backup/${ version }`, "")
const radiatorConnId = persistentAtom<string>(`velarshop_radiator_connection_active/${ version }`, "")

const radiatorConn = computed(radiatorConnId, (connId) => {
  if (!connId) return null
  const connection = radiatorConnections.find(r => r.id === connId)
  if (!connection) return null
  return connection
})

const radiatorConnPostfix = computed(radiatorConn, (connection) => {
  if (!connection) return ''
  return `, ${ connection.code }`
})


export {
  radiatorConnId,
  radiatorConn,
  radiatorConnPostfix,
  radiatorConnIdBackup,
}