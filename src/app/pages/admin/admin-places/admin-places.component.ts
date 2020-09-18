import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { PlacesService } from '../../../services/places/places.service';
import { PublicDataService } from '../../../services/public-data/public-data.service';

@Component({
  selector: 'app-admin-places',
  templateUrl: './admin-places.component.html',
  styleUrls: ['./admin-places.component.scss']
})
export class AdminPlacesComponent implements OnInit {

  places: any[] = [];
  pagination: any = {
    limite: 20,
    offset: 0,
    total: 0,
  };
  filter: any = {
    titulo: '',
    tipo: '',
    estado: '',
  };

  cities: Observable<any[]>;

  constructor(
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private router: Router,
    private publicDataService: PublicDataService,
    private toastr: ToastrService,
    ) { }

  ngOnInit(): void {
    this.fetchUrlParams();
    this.getPlaces();
  }

  getCities(): void {
    this.cities = this.publicDataService.getCities(this.filter.estado);
  }

  fetchUrlParams(): void {
    this.route.queryParamMap.subscribe(p => {
      if (p.get('offset')) { this.pagination.offset = p.get('offset'); }
      if (p.get('titulo')) { this.filter.titulo = p.get('titulo'); }
      if (p.get('tipo')) { this.filter.tipo = p.get('tipo'); }
      if (p.get('estado')) {
        this.filter.estado = p.get('estado');
        this.getCities();
      }
      if (p.get('cidade')) { this.filter.cidade = p.get('cidade'); }
    }).unsubscribe();
  }

  cleanFiltersAndSearch(): void {
    this.pagination.offset = 0;
    this.filter = {
      titulo: '',
      tipo: '',
      estado: '',
      cidade: '',
    };
    this.getPlaces();
  }

  getPlaces(): void {
    const filter = {...this.filter};
    for (const el in filter) {
      if (filter[el].length === 0){
        delete filter[el];
      }
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        offset: this.pagination.offset,
        ...filter,
      },
      queryParamsHandling: 'merge',
    });

    this.placesService.getPlaces({
      offset: this.pagination.offset,
      ...filter,
    }).subscribe((res) => {
      this.places = res.dados;
      this.pagination = res.paginacao;
    });
  }

  approvePlace(id: string, index: number): void {
    const body = {
      status: 'aprovado',
    };
    this.placesService.putPlace(id, body).subscribe((res) => {
      this.places[index].status = 'aprovado';
      this.toastr.success('Estabelecimento aprovado');
    });
  }

  deletePlace(id: string, index: number): void {
    if (window.confirm('Tem certeza que deseja excluir este estabelecimento?').valueOf()) {
      this.placesService.deletePlace(id).subscribe((res) => {
        this.places.splice(index, 1);
        this.toastr.success('Estabelecimento excluído');
      });
    }
  }

}
