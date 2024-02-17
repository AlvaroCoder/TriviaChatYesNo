function generarNumeroAleatorio(numeroInicial, numeroFinal) {
    // Validar que los parámetros sean números enteros
    if (!Number.isInteger(numeroInicial) || !Number.isInteger(numeroFinal)) {
        throw new Error('Ambos parámetros deben ser números enteros.');
    }

    // Validar que numeroFinal sea mayor que numeroInicial
    if (numeroFinal <= numeroInicial) {
        throw new Error('El segundo parámetro debe ser mayor que el primero.');
    }

    // Calcular el rango de números posibles
    const rango = numeroFinal - numeroInicial;

    // Generar un número aleatorio dentro del rango y sumarle numeroInicial para ajustarlo
    const numeroAleatorio = Math.floor(Math.random() * (rango + 1)) + numeroInicial;

    return numeroAleatorio;
}
module.exports ={ generarNumeroAleatorio }