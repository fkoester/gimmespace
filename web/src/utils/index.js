export function pick(obj, whitelisted) {
  return Object.assign({}, ...whitelisted.map((key) => ({ [key]: obj[key] })))
}

export const getResponseBody = async (response) => {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('Content-Type')?.toLowerCase()

  let data

  if (contentType?.indexOf('application/json') >= 0) {
    data = await response.json()
  } else if ([
    'text/csv',
    'application/zip',
    'application/pdf',
    'application/octet-stream'].some((t) => contentType?.indexOf(t) >= 0)) {
    data = await response.blob()
  } else {
    data = await response.text()
  }

  if (response.status >= 200 && response.status < 300 && response.ok) {
    return data
  }

  const err = new Error(data.error)
  throw err
}

export function formatCurrency(value, placeholder) {
  if (placeholder !== undefined && (value === undefined || value === null)) {
    return placeholder
  }
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

export function parseCurrency(value) {
  return parseFloat(value.replace(',', '.').replace(/[^0-9.-]+/g, ''))
}

export const maybePluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`

export function groupBy(xs, key) {
  return xs.reduce((rv, x) => ({
    ...rv,
    [x[key]]: (rv[x[key]] || []).concat([x]),
  }), {})
}

export function groupByKeyFun(xs, keyFun) {
  return xs.reduce((rv, x) => ({
    ...rv,
    [keyFun(x)]: (rv[keyFun(x)] || []).concat([x]),
  }), {})
}


export function isNumber(value) {
  return typeof value === 'number'
}
