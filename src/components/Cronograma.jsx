import React, { useState } from 'react';
import '../styles/Cronograma.css';
import { generarCronograma, validarCronograma, cantidadPerforaciones, countCycles, ESTADOS } from '../utils/auxiliar';


const Cronograma = () => {
  const [diasTrabajo, setDiasTrabajo] = useState(14);
  const [diasDescanso, setDiasDescanso] = useState(7);
  const [diasInduccion, setDiasInduccion] = useState(5);
  const [totalDiasPerforados, setTotalDiasPerforados] = useState(30);
  const [cronograma, setSchedule] = useState(null);
  const [validacion, setValidacion] = useState(null);

  const casosPrueba = [
    { name: 'Caso 1: 14x7, 5 inducción', trabajo: 14, descanso: 7, induccion: 5, perforacion: 30 },
    { name: 'Caso 2: 21x7, 3 inducción', trabajo: 21, descanso: 7, induccion: 3, perforacion: 30 },
    { name: 'Caso 3: 10x5, 2 inducción', trabajo: 10, descanso: 5, induccion: 2, perforacion: 30 },
    { name: 'Caso 4: 14x6, 4 inducción', trabajo: 14, descanso: 6, induccion: 4, perforacion: 30 },
    { name: 'Caso 5: 7x7, 1 inducción', trabajo: 7, descanso: 7, induccion: 1, perforacion: 30 }
  ];

  const cargarCasosPrueba = (casosPrueba) => {
    setDiasTrabajo(casosPrueba.trabajo);
    setDiasDescanso(casosPrueba.descanso);
    setDiasInduccion(casosPrueba.induccion);
    setTotalDiasPerforados(casosPrueba.perforacion);
  };

  const accionGenerarCronograma = () => {
    try {
      const result = generarCronograma(diasTrabajo, diasDescanso, diasInduccion, totalDiasPerforados);
      const validacionResult = validarCronograma(result);

      setSchedule(result);
      setValidacion(validacionResult);

    } catch (error) {
      alert('Error al generar cronograma: ' + error.message);
    }
  };

  const getStateClass = (state) => {
    const stateMap = {
      [ESTADOS.SUBIDA]: 'state-S',
      [ESTADOS.INDUCCION]: 'state-I',
      [ESTADOS.PERFORACION]: 'state-P',
      [ESTADOS.BAJADA]: 'state-B',
      [ESTADOS.DESCANSO]: 'state-D',
      [ESTADOS.EMPTY]: 'state---'
    };
    return stateMap[state] || 'state---';
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>Planificación de cronograma</h1>
        </div>

        <div className="test-cases">
          <h3>Casos de prueba</h3>
          <div className="test-buttons">
            {casosPrueba.map((tc, idx) => (
              <button
                key={idx}
                onClick={() => cargarCasosPrueba(tc)}
                className="test-button"
              >
                {tc.name}
              </button>
            ))}
          </div>
        </div>

        <div className="inputs-grid">
          <div className="input-group">
            <label>Días de trabajo</label>
            <input
              type="number"
              value={diasTrabajo}
              onChange={(e) => setDiasTrabajo(parseInt(e.target.value) || 0)}
              min="7"
              max="30"
            />
          </div>

          <div className="input-group">
            <label>Días de descanso</label>
            <input
              type="number"
              value={diasDescanso}
              onChange={(e) => setDiasDescanso(parseInt(e.target.value) || 0)}
              min="5"
              max="14"
            />
          </div>

          <div className="input-group">
            <label>Días de inducción</label>
            <input
              type="number"
              value={diasInduccion}
              onChange={(e) => setDiasInduccion(parseInt(e.target.value) || 0)}
              min="1"
              max="5"
            />
          </div>

          <div className="input-group">
            <label>Total días a perforar</label>
            <input
              type="number"
              value={totalDiasPerforados}
              onChange={(e) => setTotalDiasPerforados(parseInt(e.target.value) || 0)}
              min="30"
              max="365"
            />
          </div>
        </div>

        <button onClick={accionGenerarCronograma} className="calculate-button">
          Generar cronograma
        </button>

      </div>

      {validacion && (
        <div className="card stats-card">
          <h3>Estadísticas del cronograma</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{validacion.stats.totalPerforacionesPorS1}</div>
              <div className="stat-label">Días perforados por S1</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{validacion.stats.diasConDosPerforaciones}</div>
              <div className="stat-label">Días con 2 perforando</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{validacion.stats.totalDias}</div>
              <div className="stat-label">Días totales</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {((validacion.stats.totalPerforacionesPorS1 / totalDiasPerforados) * 100).toFixed(1)}%
              </div>
              <div className="stat-label">Progreso objetivo</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{validacion.stats.eficiencia}%</div>
              <div className="stat-label">Eficiencia (2 perf.)</div>
            </div>
          </div>
        </div>
      )}

      {validacion && validacion.errores.length > 0 && (
        <div className="alert alert-error">
          <div className="alert-content">
            <h3>⚠️ Errores encontrados: {validacion.errores.length}</h3>
            <ul>
              {validacion.errores.slice(0, 20).map((error, idx) => (
                <li key={idx} className={error.type === 'CRITICAL' ? 'critical-error' : ''}>
                  {error.message}
                </li>
              ))}
              {validacion.errores.length > 20 && (
                <li><strong>... y {validacion.errores.length - 20} errores más</strong></li>
              )}
            </ul>
          </div>
        </div>
      )}

      {validacion && validacion.isValid && (
        <div className="alert alert-success">
          <span>Cronograma válido: Cumple todas las reglas.</span>
        </div>
      )}

      {cronograma && (
        <div className="card schedule-card">
          <h2>Cronograma</h2>
          <div className="table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th className="sticky-col">Sup.</th>
                  {cronograma.s1.map((_, idx) => (
                    <th key={idx}>{idx}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sticky-col supervisor-label">S1</td>
                  {cronograma.s1.map((state, idx) => (
                    <td key={idx} className={`state-cell ${getStateClass(state)}`}>
                      {state}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky-col supervisor-label">S2</td>
                  {cronograma.s2.map((state, idx) => (
                    <td key={idx} className={`state-cell ${getStateClass(state)}`}>
                      {state}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky-col supervisor-label">S3</td>
                  {cronograma.s3.map((state, idx) => (
                    <td key={idx} className={`state-cell ${getStateClass(state)}`}>
                      {state}
                    </td>
                  ))}
                </tr>
                <tr className="count-row">
                  <td className="sticky-col count-label">#P</td>
                  {cronograma.s1.map((_, idx) => {
                    const count = cantidadPerforaciones(cronograma, idx);
                    const s3Active = cronograma.s3[idx] !== ESTADOS.EMPTY;
                    const isError = s3Active && (count !== 2);
                    return (
                      <td 
                        key={idx} 
                        className={`count-cell ${isError ? 'count-error' : 'count-ok'}`}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      {cronograma && (
        <div className="legend">
          <div className="legend-item">
            <div className="legend-box state-S"></div>
            <span className='text-black'>S - Subida</span>
          </div>
          <div className="legend-item">
            <div className="legend-box state-I"></div>
            <span className='text-black'>I - Inducción</span>
          </div>
          <div className="legend-item">
            <div className="legend-box state-P"></div>
            <span className='text-black'>P - Perforación</span>
          </div>
          <div className="legend-item">
            <div className="legend-box state-B"></div>
            <span className='text-black'>B - Bajada</span>
          </div>
          <div className="legend-item">
            <div className="legend-box state-D"></div>
            <span className='text-black'>D - Descanso</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cronograma;