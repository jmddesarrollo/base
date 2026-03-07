import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public isLoggedIn: boolean = false;
  public userName: string = '';

  constructor(
    private router: Router,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.websocketService.sessionOn;
    
    if (this.isLoggedIn) {
      this.userName = 'Usuario';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToUsers(): void {
    this.router.navigate(['/users']);
  }

  goToPermissions(): void {
    this.router.navigate(['/permissions']);
  }

  goToProfile(): void {
    this.router.navigate(['/my-profile']);
  }
}
