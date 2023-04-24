const exhaustedCheck = ( value: never ): never => {
  console.log( `Unhandled discriminated union member: ${ JSON.stringify( value ) }` )
  return value
}

export { exhaustedCheck }