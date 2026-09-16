import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.page.html',
  styleUrls: ['./rendez-vous.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RendezVousPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
