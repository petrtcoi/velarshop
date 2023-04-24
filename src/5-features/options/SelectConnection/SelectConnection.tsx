import { useStore } from '@nanostores/preact'
import { useEffect } from "preact/hooks"

import Select from "@shared/components/Select"

import { radiatorConnections } from "@entities/RadiatorConnection"

import {
  radiatorConnId as storeRadiatorConnId,
  radiatorConnIdBackup as storeRadiatorConnIdBackup
} from "./store/radiatorConnection"
import type { ModelJson } from "@entities/Model"


type Props = {
  model: ModelJson
}

function SelectConnection ({ model }: Props) {

  const radiatorConnIdBackup = useStore(storeRadiatorConnIdBackup)
  const radiatorConnId = useStore(storeRadiatorConnId)

  const modelConnections = model.connections.split(",")
  const connections = radiatorConnections.filter((conn) =>
    modelConnections.includes(conn.id)
  )

  const options = connections.map(conn => ({ id: conn.id, label: conn.description }))


  useEffect(() => {
    if (connections.length === 0) return
    const isBackupConnIdInList = connections.some(conn => conn.id === radiatorConnIdBackup)
    storeRadiatorConnId.set(
      isBackupConnIdInList
        ? radiatorConnIdBackup
        : connections[ 0 ].id
    )
  }, [])

  const handleChange = (id: string) => {
    storeRadiatorConnId.set(id)
    storeRadiatorConnIdBackup.set(id)
  }

  if (connections.length === 0) return null

  return (
    <div class='mt-5 mb-2'>
      <label
        for='select_radiator_connection'
        class='block text-xs font-thin'
      >
        Подключение радиатора:
      </label>
      <Select
        options={ options }
        selected={ radiatorConnId }
        onChange={ handleChange }
        id='select_radiator_connection'
      />

    </div>
  )
}


export default SelectConnection