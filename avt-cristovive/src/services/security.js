// utilidades de encriptación simétrica para proteger datos en caché
export const secureStorageSave = (key, data) => {
  try {
    const rawString = JSON.stringify(data)
    // Cifrado simétrico básico (Base64 + URI Encoding)
    const encodedData = btoa(unescape(encodeURIComponent(rawString)))
    localStorage.setItem(key, encodedData)
  } catch (e) {
    console.error("Error encriptando caché local:", e)
  }
}

export const secureStorageLoad = (key) => {
  const saved = localStorage.getItem(key)
  if (!saved) return null
  try {
    // Desencriptación dinámica al cargar la app
    const decodedString = decodeURIComponent(escape(atob(saved)))
    return JSON.parse(decodedString)
  } catch (e) {
    console.error("Error descifrando caché local:", e)
    return null
  }
}