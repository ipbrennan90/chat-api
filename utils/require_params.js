const paramsExist = (params, paramsContainer) => {
  const missingParams = params.reduce((missing, current) => {
    if (current in paramsContainer && paramsContainer[current] != null) {
      return missing
    }
    return [...missing, current]
  }, [])
  const paramsMissing = missingParams.length > 0
  return [paramsMissing, missingParams]
}

const requireParams = (params, query = false) => (req, res, next) => {
  let paramsContainer = req.body

  if (query) {
    paramsContainer = req.query
  }

  const [paramsMissing, missingParams] = paramsExist(params, paramsContainer)

  if (!paramsMissing) {
    next()
  } else {
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = missingParams
        .map(param => `${param} cannot be blank`)
        .join(', ')
      console.warn(errorMessage)
    }
    res.status(400).json({ status: 'error' })
  }
}

export default requireParams
