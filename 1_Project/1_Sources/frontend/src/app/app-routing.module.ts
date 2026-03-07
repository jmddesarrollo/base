import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/session/login/login.component';
import { PermissionsListComponent } from './components/permissions/permissions-list/permissions-list.component';
import { RecoveryComponent } from './components/session/recovery/recovery.component';
import { RedirectComponent } from './components/redirect/redirect.component';
import { UserMyprofileComponent } from './components/users/user-myprofile/user-myprofile.component';
import { UsersListComponent } from './components/users/users-list/users-list.component';

// Guards
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, data: {titulo: 'App Base - Inicio'} },
  { path: 'login', component: LoginComponent, data: {titulo: 'App Base - Inicio de sesión'}  },
  { path: 'recovery/:token', component: RecoveryComponent, data: {titulo: 'App Base - Regenerar contraseña'} },
  { path: 'users', component: UsersListComponent, canActivate: [AuthGuard], data: {titulo: 'App Base - Usuarios'} },
  { path: 'my-profile', component: UserMyprofileComponent, canActivate: [AuthGuard], data: {titulo: 'App Base - Perfil del usuario'} },
  { path: 'permissions', component: PermissionsListComponent, canActivate: [AuthGuard], data: {titulo: 'App Base - Permisos'} },
  { path: 'redirect', component: RedirectComponent, data: {titulo: 'App Base - Redirección'} },
  { path: '404', component: RedirectComponent, data: {titulo: 'App Base - Redirección'} },
  { path: '**', component: RedirectComponent, data: {titulo: 'App Base - Redirección'}  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
