import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  apiOnline = false;
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkApi();
    setInterval(() => this.checkApi(), 15000);
  }

  checkApi() {
    this.http.get(this.apiUrl, { observe: 'response' }).subscribe({
      next: () => this.apiOnline = true,
      error: () => this.apiOnline = false
    });
  }
}
