const serialize = (instance, serializer) => {
  const result = {}
  for (const attribute of serializer.options.attributes) {
    let resultAttribute = instance[attribute]
    if (attribute in serializer) {
      resultAttribute = serializer[attribute](resultAttribute)
    }
    result[attribute] = resultAttribute
  }

  return result
}

export default serialize
