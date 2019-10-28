const requireParams = params => (req, res, next) => {
  const missingParams = params.reduce((missing, current) => {
    if (current in req.body && req.body[current] != null) {
      return missing
    }
    return [...missing, current]
  }, [])
  if (missingParams.length === 0) {
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
  return
}

export default requireParams
