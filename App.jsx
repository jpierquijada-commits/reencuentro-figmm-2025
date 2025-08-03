import React, { useState, useEffect } from 'react';
import { Check, User, Mail, Phone, CreditCard, MapPin } from 'lucide-react';

const ReencuentroEgresados = () => {
  const [currentScreen, setCurrentScreen] = useState('access'); // access, seats, form, confirmation
  const [accessCode, setAccessCode] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    email: ''
  });
  const [reservedSeats, setReservedSeats] = useState({});

  // Colores del proyecto
  const colors = {
    primary: 'rgb(113,22,16)',
    secondary: 'rgb(154,153,157)',
    white: 'white'
  };

  // Códigos de acceso válidos (en producción vendrían de Supabase)
  const validCodes = ['FIGMM2025', 'EGRESADO001', 'REENCUENTRO01'];

  // Generar asientos por mesa (30 mesas x 10 asientos)
  const generateSeats = () => {
    const seats = [];
    for (let table = 1; table <= 30; table++) {
      for (let seat = 1; seat <= 10; seat++) {
        seats.push({
          id: `M${table}-A${seat}`,
          table: table,
          seat: seat,
          angle: (seat - 1) * 36, // 360° / 10 asientos
        });
      }
    }
    return seats;
  };

  const seats = generateSeats();

  // Validar código de acceso
  const handleAccessSubmit = () => {
    if (validCodes.includes(accessCode.toUpperCase())) {
      setCurrentScreen('seats');
    } else {
      alert('Código de acceso inválido');
    }
  };

  // Validar formulario
  const validateForm = () => {
    const { nombres, apellidos, dni, celular, email } = formData;
    
    if (!nombres || !apellidos || !dni || !celular || !email) {
      alert('Todos los campos son obligatorios');
      return false;
    }
    
    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
      alert('El DNI debe tener exactamente 8 dígitos');
      return false;
    }
    
    if (celular.length !== 9 || !/^\d+$/.test(celular)) {
      alert('El celular debe tener exactamente 9 dígitos');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Ingrese un email válido');
      return false;
    }
    
    return true;
  };

  // Confirmar reserva
  const handleConfirmReservation = () => {
    if (validateForm()) {
      setReservedSeats({
        ...reservedSeats,
        [selectedSeat]: `${formData.nombres} ${formData.apellidos}`
      });
      setCurrentScreen('confirmation');
    }
  };

  // Renderizar mesa individual
  const renderTable = (tableNumber, centerX, centerY) => {
    const tableSeats = seats.filter(seat => seat.table === tableNumber);
    const radius = 40;
    
    return (
      <g key={tableNumber}>
        {/* Mesa circular */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={colors.secondary}
          stroke={colors.primary}
          strokeWidth="2"
        />
        
        {/* Número de mesa */}
        <text
          x={centerX}
          y={centerY + 5}
          textAnchor="middle"
          fontSize="12"
          fill={colors.white}
          fontWeight="bold"
        >
          M{tableNumber}
        </text>
        
        {/* Asientos alrededor de la mesa */}
        {tableSeats.map(seat => {
          const seatX = centerX + (radius + 20) * Math.cos((seat.angle - 90) * Math.PI / 180);
          const seatY = centerY + (radius + 20) * Math.sin((seat.angle - 90) * Math.PI / 180);
          const isReserved = reservedSeats[seat.id];
          const isSelected = selectedSeat === seat.id;
          
          return (
            <g key={seat.id}>
              <circle
                cx={seatX}
                cy={seatY}
                r="12"
                fill={isSelected ? colors.primary : isReserved ? colors.secondary : colors.white}
                stroke={colors.primary}
                strokeWidth="2"
                style={{ cursor: isReserved ? 'not-allowed' : 'pointer' }}
                onClick={() => {
                  if (!isReserved && currentScreen === 'seats') {
                    setSelectedSeat(seat.id);
                  }
                }}
              />
              <text
                x={seatX}
                y={seatY + 3}
                textAnchor="middle"
                fontSize="8"
                fill={isSelected || isReserved ? colors.white : colors.primary}
                fontWeight="bold"
              >
                {seat.seat}
              </text>
              {isReserved && (
                <text
                  x={seatX}
                  y={seatY + 25}
                  textAnchor="middle"
                  fontSize="6"
                  fill={colors.primary}
                  fontWeight="bold"
                >
                  {isReserved.split(' ')[0]}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  // Pantalla de código de acceso
  const AccessScreen = () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.secondary }}>
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
            Reencuentro FIGMM 2025
          </h1>
          <p className="text-gray-600">Ingrese su código de acceso para reservar su asiento</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Acceso
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{ focusRingColor: colors.primary }}
              placeholder="Ingrese su código"
              onKeyPress={(e) => e.key === 'Enter' && handleAccessSubmit()}
            />
          </div>
          
          <button
            onClick={handleAccessSubmit}
            className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors"
            style={{ backgroundColor: colors.primary }}
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );

  // Pantalla de selección de asientos
  const SeatsScreen = () => {
    // Distribución en herradura
    const getTablePosition = (tableIndex) => {
      const angle = (tableIndex / 30) * 180 + 180; // Herradura de 180°
      const radius = 200;
      const centerX = 400;
      const centerY = 300;
      
      return {
        x: centerX + radius * Math.cos(angle * Math.PI / 180),
        y: centerY + radius * Math.sin(angle * Math.PI / 180)
      };
    };

    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.white }}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
              Seleccione su Asiento
            </h1>
            <p className="text-gray-600">Haga clic en un asiento disponible para reservarlo</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mapa de asientos */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <svg viewBox="0 0 800 600" className="w-full h-auto border rounded">
                  {/* Escenario */}
                  <rect
                    x="300"
                    y="50"
                    width="200"
                    height="80"
                    fill={colors.primary}
                    rx="10"
                  />
                  <text
                    x="400"
                    y="95"
                    textAnchor="middle"
                    fontSize="16"
                    fill={colors.white}
                    fontWeight="bold"
                  >
                    ESCENARIO
                  </text>
                  
                  {/* Mesas en distribución herradura */}
                  {Array.from({ length: 30 }, (_, i) => {
                    const pos = getTablePosition(i);
                    return renderTable(i + 1, pos.x, pos.y);
                  })}
                </svg>
                
                {/* Leyenda */}
                <div className="mt-4 flex justify-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-white border-2 mr-2" style={{ borderColor: colors.primary }}></div>
                    <span className="text-sm">Disponible</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colors.primary }}></div>
                    <span className="text-sm">Seleccionado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colors.secondary }}></div>
                    <span className="text-sm">Ocupado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel lateral */}
            {selectedSeat && (
              <div className="lg:w-80">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
                    Asiento Seleccionado
                  </h3>
                  <div className="mb-4 p-3 rounded" style={{ backgroundColor: colors.secondary + '20' }}>
                    <p className="font-medium">Mesa: {selectedSeat.split('-')[0]}</p>
                    <p className="font-medium">Asiento: {selectedSeat.split('-')[1]}</p>
                  </div>
                  
                  <button
                    onClick={() => setCurrentScreen('form')}
                    className="w-full py-3 px-4 rounded-lg text-white font-semibold"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Continuar con Reserva
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de formulario
  const FormScreen = () => (
    <div className="min-h-screen" style={{ backgroundColor: colors.secondary + '20' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.primary }}>
              Datos del Participante
            </h2>
            
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: colors.secondary + '20' }}>
              <p className="text-sm font-medium">Asiento: {selectedSeat}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Nombres
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                  placeholder="Ingrese sus nombres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Apellidos
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                  placeholder="Ingrese sus apellidos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="inline w-4 h-4 mr-1" />
                  DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                  placeholder="12345678"
                  maxLength="8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Celular (9 dígitos)
                </label>
                <input
                  type="text"
                  value={formData.celular}
                  onChange={(e) => setFormData({...formData, celular: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                  placeholder="987654321"
                  maxLength="9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setCurrentScreen('seats')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700"
                >
                  Regresar
                </button>
                <button
                  onClick={handleConfirmReservation}
                  className="flex-1 py-3 px-4 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: colors.primary }}
                >
                  Confirmar Reserva
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Pantalla de confirmación
  const ConfirmationScreen = () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.secondary + '20' }}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
            ¡Reserva Confirmada!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Su asiento ha sido reservado exitosamente
          </p>

          {/* Ticket */}
          <div className="border-2 border-dashed p-4 mb-6" style={{ borderColor: colors.primary }}>
            <h3 className="font-bold mb-3" style={{ color: colors.primary }}>TICKET DE RESERVA</h3>
            <div className="text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Nombre:</span>
                <span className="font-medium">{formData.nombres} {formData.apellidos}</span>
              </div>
              <div className="flex justify-between">
                <span>DNI:</span>
                <span className="font-medium">{formData.dni}</span>
              </div>
              <div className="flex justify-between">
                <span>Asiento:</span>
                <span className="font-medium">{selectedSeat}</span>
              </div>
              <div className="flex justify-between">
                <span>Evento:</span>
                <span className="font-medium">Reencuentro FIGMM 2025</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 mb-6">
            <p className="font-medium mb-2">¡Importante!</p>
            <p>Guarde este ticket como comprobante de su reserva. Le enviaremos la confirmación a {formData.email}</p>
          </div>

          <button
            onClick={() => {
              setCurrentScreen('access');
              setSelectedSeat(null);
              setFormData({nombres: '', apellidos: '', dni: '', celular: '', email: ''});
              setAccessCode('');
            }}
            className="w-full py-3 px-4 rounded-lg text-white font-semibold"
            style={{ backgroundColor: colors.primary }}
          >
            Nueva Reserva
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar pantalla actual
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'access':
        return <AccessScreen />;
      case 'seats':
        return <SeatsScreen />;
      case 'form':
        return <FormScreen />;
      case 'confirmation':
        return <ConfirmationScreen />;
      default:
        return <AccessScreen />;
    }
  };

  return renderCurrentScreen();
};

export default ReencuentroEgresados;
