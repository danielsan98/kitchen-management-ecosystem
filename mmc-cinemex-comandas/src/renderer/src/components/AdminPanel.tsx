// src/components/AdminPanel.tsx
// import React from 'react';
// import { useAuth } from '../auth/context/AuthContext';

// const AdminPanel = () => {
//   const { keycloak } = useAuth();

//   const isAdmin = keycloak.hasRealmRole('admin'); // Verifica si el usuario tiene el rol 'admin'

//   if (!isAdmin) {
//     return <div>Acceso denegado</div>;
//   }

//   return (
//     <div>
//       <h1>Panel de Administración</h1>
//       {/* Contenido del panel de administración */}
//     </div>
//   );
// };

// export default AdminPanel;