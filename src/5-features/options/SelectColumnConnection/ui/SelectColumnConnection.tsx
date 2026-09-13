import { useStore } from "@nanostores/preact"
import { useEffect } from "preact/hooks"

import Select from "@shared/components/Select"

import { columnConnections } from "@entities/RadiatorConnection"

import {
  columnConnId as storeColumnConnId,
  columnConnIdBackup as storeColumnConnIdBackup,
} from "../store/columnConnection"
import type { ModelJson } from "@entities/Model"

type Props = {
  model: ModelJson
}

function SelectColumnConnection({ model }: Props) {
  const columnConnIdBackup = useStore(storeColumnConnIdBackup)
  const columnConnId = useStore(storeColumnConnId)

  const connections = columnConnections

  const options = connections.map(conn => ({
    id: conn.id,
    label: conn.description,
  }))

  useEffect(() => {
    if (connections.length === 0) return
    const isBackupConnIdInList = connections.some(
      conn => conn.id === columnConnIdBackup
    )
    storeColumnConnId.set(
      isBackupConnIdInList ? columnConnIdBackup : connections[0].id
    )
  }, [])

  const handleChange = (id: string) => {
    storeColumnConnId.set(id)
    storeColumnConnIdBackup.set(id)
  }

  if (connections.length === 0) return null

  return (
    <div class="mt-5 mb-2">
      <label
        for="select_column_radiator_connection"
        class="block text-xs font-thin"
      >
        Подключение радиатора:
      </label>
      <Select
        options={options}
        selected={columnConnId}
        onChange={handleChange}
        id="select_column_radiator_connection"
      />
    </div>
  )
}

export default SelectColumnConnection
