
export const ESTADOS = {
  EMPTY: '-',
  SUBIDA: 'S',
  INDUCCION: 'I',
  PERFORACION: 'P',
  BAJADA: 'B',
  DESCANSO: 'D'
};

/*
 * genera el cronograma inicial
 */
function generarCronogramaInicial(diasTrabajo, diasDescanso, diasInduccion, diasPerforacion) {
  const cronograma = [];
  let diaActual = 0;
  let perforacionesCompletadas = 0;
  let cantidadCiclos = 0;
  
  while (perforacionesCompletadas < diasPerforacion) {
    //subida (1 día)
    cronograma[diaActual] = ESTADOS.SUBIDA;
    diaActual++;
    perforacionesCompletadas++;
    
    //induccion(solo primer ciclo)
    if (cantidadCiclos === 0) {
      for (let i = 0; i < diasInduccion; i++) {
        cronograma[diaActual] = ESTADOS.INDUCCION;
        diaActual++;
        perforacionesCompletadas++;
        if (perforacionesCompletadas >= diasPerforacion) break;
      }
    }
    
    // Perforación
    const cicloPerforaciones = cantidadCiclos === 0 ? diasTrabajo - diasInduccion : diasTrabajo;
    
    const restantePerforaciones = diasPerforacion - perforacionesCompletadas;
    const actualPerforaciones = Math.min(cicloPerforaciones, restantePerforaciones);
    
    for (let i = 0; i < actualPerforaciones; i++) {
      cronograma[diaActual] = ESTADOS.PERFORACION;
      diaActual++;
      perforacionesCompletadas++;
      if (perforacionesCompletadas >= diasPerforacion) break;
    }
    
    if (perforacionesCompletadas >= diasPerforacion) break;
    
    //bajada (1 dia)
    cronograma[diaActual] = ESTADOS.BAJADA;
    diaActual++;
    perforacionesCompletadas++;
    if (perforacionesCompletadas >= diasPerforacion) break;
    
    //descanso (M - 2 dias)
    const realDiasDescanso = diasDescanso - 2;
    for (let i = 0; i < realDiasDescanso; i++) {
      cronograma[diaActual] = ESTADOS.DESCANSO;
      diaActual++;
      perforacionesCompletadas++;
      if (perforacionesCompletadas >= diasPerforacion) break;
    }
    
    cantidadCiclos++;
  }
  
  return cronograma;
}

/**
 *genera el cronograma de S2 y S3
 */
function generarS2S3(s1, diasTrabajo, diasDescanso, diasInduccion) {
  let diasVacio = diasDescanso - 3;
  let s2 = generarCronogramaInicial(diasTrabajo, diasVacio, diasInduccion, diasTrabajo - diasVacio);
  
  let inicioS3 = s1.findIndex(state => state === ESTADOS.BAJADA);
  let s3 = Array(inicioS3 - diasInduccion - 1).fill(ESTADOS.EMPTY)
      .concat(
    generarCronogramaInicial(diasTrabajo, diasVacio, diasInduccion, diasTrabajo - diasVacio) 
  );
  

  let contadorS2 = s2.length;
  while(s2.length < s1.length){
    if (s1[contadorS2] === ESTADOS.PERFORACION){
      let proximaBajadaS1 = buscarDesdeIndice(s1, contadorS2, state => state === ESTADOS.BAJADA);
      if ((proximaBajadaS1 - contadorS2) + 1 < diasDescanso) {
        s2.push(ESTADOS.PERFORACION)
      } else {
        s2.push(ESTADOS.EMPTY)
      }
    } else {
      s2.push(ESTADOS.PERFORACION)
    }
    contadorS2++;
  }
  s2 = transformarTodosSegmentosVacios(s2);

  
  let contadorS3 = s3.length;  
  while(s3.length < s1.length){
    if (s1[contadorS3] === ESTADOS.PERFORACION && s2[contadorS3] === ESTADOS.PERFORACION){
      s3.push(ESTADOS.EMPTY)
    } else {
      s3.push(ESTADOS.PERFORACION)
    }
    contadorS3++;
  }
  s3 = transformarTodosSegmentosVacios(s3);

  //limpiar inicio de s3
  let dia = 0;
  while(dia < (inicioS3 - diasInduccion - 1)) {
    s3[dia++] = ESTADOS.EMPTY;
  }

  return {s1, s2, s3};
}

function transformarTodosSegmentosVacios(cronograma) {
  if (!cronograma || !Array.isArray(cronograma)) return [];
  
  const result = [...cronograma];
  let segmentoInicial = -1;
  let segmentoLength = 0;
  
  for (let i = 0; i <= result.length; i++) {
    //si encontramos un EMPTY o estamos al final del array
    if (i < result.length && result[i] === ESTADOS.EMPTY) {
      if (segmentoInicial === -1) {
        segmentoInicial = i;
      }
      segmentoLength++;
    } else if (segmentoInicial !== -1) {
      //procesar el segmento encontrado
      if (segmentoLength === 1) {
        result[segmentoInicial] = ESTADOS.BAJADA;
      } else {
        result[segmentoInicial] = ESTADOS.BAJADA;
        result[segmentoInicial + segmentoLength - 1] = ESTADOS.SUBIDA;
        
        for (let j = segmentoInicial + 1; j < segmentoInicial + segmentoLength - 1; j++) {
          result[j] = ESTADOS.DESCANSO;
        }
      }
      
      //resetear para el próximo segmento
      segmentoInicial = -1;
      segmentoLength = 0;
    }
  }
  
  return result;
}

const buscarDesdeIndice = (array, startPos, predicate) => {
  const index = array.slice(startPos + 1).findIndex(predicate);
  return index === -1 ? -1 : startPos + 1 + index;
};

export function generarCronograma(diasTrabajo, diasDescanso, diasInduccion, diasPerforacion) {

  if (diasTrabajo < 7 || diasTrabajo > 30) {
    throw new Error('Días de trabajo deben estar entre 7 y 30');
  }

  if (diasDescanso < 5 || diasDescanso > 14) {
    throw new Error('Días de descanso deben estar entre 5 y 14');
  }

  if (diasInduccion < 1 || diasInduccion > 5) {
    throw new Error('Días de inducción deben estar entre 1 y 5');
  }

  if (diasPerforacion < 30) {
    throw new Error('Mínimo 30 días de perforación');
  }
  
  const realDiasDescanso = diasDescanso - 2;
  if (realDiasDescanso < 0) {
    throw new Error('Días de descanso insuficientes (M debe ser >= 2)');
  }
  
  const diasPerforacionPorCiclo = diasTrabajo - diasInduccion;
  if (diasPerforacionPorCiclo <= 0) {
    throw new Error('Días de trabajo insuficientes para la inducción');
  }
  
  let s1Initial = generarCronogramaInicial(diasTrabajo, diasDescanso, diasInduccion, diasPerforacion);
  let {s1, s2, s3} = generarS2S3(s1Initial, diasTrabajo, diasDescanso, diasInduccion);

  return {s1, s2, s3};
}

export function validarCronograma(cronograma) {
  const errores = [];
  const { s1, s2, s3 } = cronograma;
  const totalDias = Math.max(s1.length, s2.length, s3.length);
  
  let s3Comenzado = false;
  let totalPerforacionesPorS1 = 0;
  let diasConDosPerforaciones = 0;
  
  for (let day = 0; day < totalDias; day++) {
    const estadoS1 = s1[day] || ESTADOS.EMPTY;
    const estadoS2 = s2[day] || ESTADOS.EMPTY;
    const estadoS3 = s3[day] || ESTADOS.EMPTY;
    
    //contar perforando
    const perforando = [estadoS1, estadoS2, estadoS3].filter(
      s => s === ESTADOS.PERFORACION
    ).length;
    
    if (estadoS1 === ESTADOS.PERFORACION) totalPerforacionesPorS1++;
    if (perforando === 2) diasConDosPerforaciones++;
    
    //detectar si S3 ya empezó
    if (estadoS3 !== ESTADOS.EMPTY) {
      s3Comenzado = true;
    }
    
    //validaciones criticas
    if (s3Comenzado) {
      if (perforando === 3) {
        errores.push({
          day,
          type: 'CRITICAL',
          message: `Día ${day}: 3 supervisores perforando (VIOLACIÓN CRÍTICA)`
        });
      }
      
      if (perforando === 1) {
        errores.push({
          day,
          type: 'ERROR',
          message: `Día ${day}: Solo 1 supervisor perforando`
        });
      }
      
      if (perforando === 0) {
        errores.push({
          day,
          type: 'ERROR',
          message: `Día ${day}: 0 supervisores perforando`
        });
      }
    }
    
    //validar patrones inválidos
    if (day > 0) {
      //subida consecutiva
      [s2, s3].forEach((sup, idx) => {
        if (sup[day] === ESTADOS.SUBIDA && sup[day - 1] === ESTADOS.SUBIDA) {
          errores.push({
            day,
            type: 'PATTERN',
            message: `Día ${day}: S${idx + 2} tiene subida consecutiva (S-S)`
          });
        }
      });
      
      //sube y baja sin perforar
      [s2, s3].forEach((sup, idx) => {
        if (sup[day] === ESTADOS.BAJADA && sup[day - 1] === ESTADOS.SUBIDA) {
          errores.push({
            day,
            type: 'PATTERN',
            message: `Día ${day}: S${idx + 2} sube y baja sin perforar (S-B)`
          });
        }
      });
    }
  }
  
  return {
    isValid: errores.length === 0,
    errores,
    stats: {
      totalDias,
      totalPerforacionesPorS1,
      diasConDosPerforaciones,
      eficiencia: ((diasConDosPerforaciones / totalDias) * 100).toFixed(1)
    }
  };
}

/**
 * cuenta cuantos supervisores estan perforando en un día especifico
 */
export function cantidadPerforaciones(cronograma, day) {
  const { s1, s2, s3 } = cronograma;
  let count = 0;
  if (s1[day] === ESTADOS.PERFORACION) count++;
  if (s2[day] === ESTADOS.PERFORACION) count++;
  if (s3[day] === ESTADOS.PERFORACION) count++;
  return count;
}

/**
 * cuenta los ciclos de un supervisor
 */
export function countCycles(supervisorCronograma) {
  return supervisorCronograma.filter(state => state === ESTADOS.SUBIDA).length;
}