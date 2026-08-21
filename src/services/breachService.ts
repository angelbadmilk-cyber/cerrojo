// Servicio para consultar Have I Been Pwned usando k-anonymity (privacidad total)
// Nunca enviamos la contraseña real, solo los primeros 5 caracteres del hash SHA-1

async function sha1(texto: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verificarComprometida(password: string): Promise<boolean> {
  try {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5).toUpperCase();
    const suffix = hash.slice(5).toUpperCase();

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return false;

    const texto = await response.text();
    const lineas = texto.split('\n');

    for (const linea of lineas) {
      const [sufijo] = linea.split(':');
      if (sufijo.trim() === suffix) {
        return true; // La contraseña ha aparecido en una filtración
      }
    }
    return false;
  } catch {
    // Si hay error de red o cualquier problema, asumimos que no está comprometida
    return false;
  }
}

export async function verificarMultiples(
  passwords: string[],
): Promise<Map<string, boolean>> {
  const resultados = new Map<string, boolean>();
  
  // Verificar en paralelo (con límite para no saturar la API)
  const promises = passwords.map(async (password) => {
    const comprometida = await verificarComprometida(password);
    resultados.set(password, comprometida);
  });

  await Promise.all(promises);
  return resultados;
}