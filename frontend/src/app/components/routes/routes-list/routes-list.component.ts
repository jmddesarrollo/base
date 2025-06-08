import { Component, OnInit } from '@angular/core';

import { TitleShareService } from '../../../services/share/title.service';

@Component({
  selector: 'app-routes-list',
  templateUrl: './routes-list.component.html',
  styleUrls: ['./routes-list.component.css']
})
export class RoutesListComponent implements OnInit {

  public routes: any[];

  private title: string;

  constructor(
        private titleShareService: TitleShareService,
  ) {
    // Título de la página
    this.title = 'Listado de rutas';

    this.routes = [
      {
        date: '05 Abril',
        name: 'Rascafria - Carro del Diablo por Bolsque Finlandes - Robledal de Horcajuelos',
      },
      {
        date: '26 Abril',
        name: 'Cercedilla - Monton de Trigo'
      },
      {
        date: '17 Mayo',
        name: 'Hoyos del Espino - Plataforma de Gredos - Laguna Grande'
      },
      {
        date: '31 Mayo',
        name: 'La chorranca - Bosque de Valsain'
      },
      {
        date: '14 Junio',
        name: 'Arenas de San Pedro - Senda de los pescadores'
      },
      {
        date: '12 Julio',
        name: 'Comida o cena fin de curso'
      }
    ]
  }

  ngOnInit(): void {
    this.changeTitle();
  }

  changeTitle(): void {
    this.titleShareService.changeTitle(this.title);
  }
}
