import { Component, OnInit } from '@angular/core';

import { TitleShareService } from '../../../services/share/title.service';

@Component({
  selector: 'app-route-detail',
  templateUrl: './route-detail.component.html',
  styleUrls: ['./route-detail.component.css']
})
export class RouteDetailComponent implements OnInit {
  public mapaWikiloc: string;
  public perfilWikiloc: string;

  private title: string;

  constructor(
    private titleShareService: TitleShareService,
  ) {
    // Título de la página
    this.title = 'Detalle de ruta';

    // Código de incrustación del mapa y el perfil de Wikiloc
    this.mapaWikiloc = '<iframe frameBorder="0" scrolling="no" src="https://es.wikiloc.com/wikiloc/embedv2.do?id=160340185&elevation=on&images=off&maptype=H" width="600" height="500"></iframe><div style="color:#777;font-size:11px;line-height:16px;">Powered by&nbsp;<a style="color:#4C8C2B;font-size:11px;line-height:16px;" target="_blank" href="https://es.wikiloc.com">Wikiloc</a></div>';
  }

  ngOnInit(): void {
    this.changeTitle();
  }

  changeTitle(): void {
    this.titleShareService.changeTitle(this.title);
  }

}
