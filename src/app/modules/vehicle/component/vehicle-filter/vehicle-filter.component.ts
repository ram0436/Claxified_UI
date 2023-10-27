import { Component, ViewChild, ElementRef, Renderer2, HostListener, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Filter } from 'src/app/shared/model/Filter';
import { CommonService } from 'src/app/shared/service/common.service';
import { VehicleService } from '../../service/vehicle.service';
import { FuelType } from 'src/app/shared/enum/FuelType';
import { TransmissionType } from 'src/app/shared/enum/TransmissionType';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { MatSelectionList } from '@angular/material/list';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'app-vehicle-filter',
  templateUrl: './vehicle-filter.component.html',
  styleUrls: ['./vehicle-filter.component.css']
})
export class VehicleFilterComponent {

  @Output() resetClicked: EventEmitter<void> = new EventEmitter<void>();

  stateControl = new FormControl("");
  cityControl = new FormControl("");
  nearByControl = new FormControl("");
  filteredStates!: Observable<{ id: number; name: string; }[]>;
  filteredCities!: Observable<{ id: number; name: string; }[]>;
  filteredNearBy!: Observable<{ id: number; name: string; }[]>;
  priceRange: number = 0;
  country: any;
  districts: any = [];
  cities: any = [];
  nearByPlaces: any = [];
  selectedBrand: string = '';
  fromPrice = 0;
  toPrice = 0;
  fromKms = 0;
  toKms = 0;
  brands: any = [];
  subCategory: any;
  mainCategory: string = "";
  filterObj = new Filter();
  fuelTypes = Object.keys(FuelType).map((key: any) => ({
    label: key,
    id: FuelType[key],
  }));
  transmissionTypes = Object.keys(TransmissionType).map((key: any) => ({
    label: key,
    id: TransmissionType[key],
  }));
  numberOfOwners = [1, 2, 3, 4];
  fromYear: any;
  toYear: any;
  appliedFilters: any = [];
  @ViewChild('brandMultiSelect') brandMultiSelect!: MatSelect;
  @ViewChild('ownerMultiSelect') ownerMultiSelect!: MatSelect;
  @ViewChild('fuelMultiSelect') fuelMultiSelect!: MatSelect;
  @ViewChild('transMultiSelect') transMultiSelect!: MatSelect;
  @ViewChild('stateMatAutocomplete') stateAutocomplete!: MatAutocomplete;
  @ViewChild('cityMatAutocomplete') cityAutocomplete!: MatAutocomplete;
  @ViewChild('nearByMatAutocomplete') nearByAutocomplete!: MatAutocomplete;
  @ViewChild(MatSelectionList)
  matSelectionList!: MatSelectionList;

  //Changes made by Hamza
  filtersSelected: boolean = false; 
  initialFilters: any;

  constructor(private commonService: CommonService, private route: ActivatedRoute,
    private vehicleService: VehicleService) { }

  ngOnInit() {
    this.fuelTypes = this.fuelTypes.slice(this.fuelTypes.length / 2);
    this.transmissionTypes = this.transmissionTypes.slice(this.transmissionTypes.length / 2);
    this.commonService.getCountry().subscribe((data: any) => {
      this.country = data[0];
      this.getAllStates();
    });
    this.route.queryParams.subscribe(params => {
      this.subCategory = params['sub'];
      this.mainCategory = params['type'];
      if(this.subCategory !=undefined)
      this.filterObj.subCategoryId = Number(this.subCategory);
      switch (this.subCategory) {
        case "4": {
          this.getCarBrands();
          break;
        }
        case "5": {
          this.getBikeBrands();
          break;
        }
      }
    });
    this.initialFilters = { ...this.filterObj };
    
  }
  getAllStates() {
    this.commonService.getStatesByCountry(this.country.id).subscribe(data => {
      this.districts = data;
      this.getFilteredStates();
    });
  }
  onDistrictChange(event: any) {
    this.filterObj.state = (event.option.value == null) ? null : event.option.value.name;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("state", this.filterObj.state);
    if (this.filterObj.state == null)
      this.appliedFilters = this.appliedFilters.filter((item: any) => (item.name != 'city' && item.name != 'nearBy'));
    else
      this.getCities(event.option.value.id);

    this.filtersSelected = true; //Changes made by Hamza
    this.filterObj.state = event.option.value ? event.option.value.name : null;
    this.filterObj.city = null; // Reset city when state changes
    this.filterObj.nearBy = null; // Reset nearby when state changes
  }
  getCities(stateId: Number) {
    this.commonService.getCitiesByState(stateId).subscribe(data => {
      this.cities = data;
      this.getFilteredCities();
    });
  }
  onCityChange(event: any) {
    this.filterObj.city = (event.option.value == null) ? null : event.option.value.name;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("city", this.filterObj.city);
    if (this.filterObj.city == null)
      this.appliedFilters = this.appliedFilters.filter((item: any) => (item.name != 'nearBy'));
    else
      this.getNearByPlaces(event.option.value.id);
    this.filtersSelected = true; //Changes made by Hamza
  }
  onNearByChange(event: any) {
    this.filterObj.nearBy = (event.option.value == null) ? null : event.option.value.name;
    this.updateAppliedFilters("nearBy", this.filterObj.nearBy);
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true; //Changes made by Hamza
  }
  priceChange() {
    let prices = [];
    prices.push(Number(this.fromPrice));
    prices.push(Number(this.toPrice));
    this.filterObj.price = prices;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("price", this.formatAmount(this.fromPrice) + " - " + this.formatAmount(this.toPrice));
    this.filtersSelected = true; //Changes made by Hamza
  }
  getCarBrands() {
    this.vehicleService.getCarBrands().subscribe(data => {
      this.brands = data;
    });
  }
  getBikeBrands() {
    this.vehicleService.getBikeBrands().subscribe(data => {
      this.brands = data;
    });
  }
  onBrandSelect(event: any) {
    let brandIds = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'brands');
    for (let value of event.value) {
      brandIds.push(value.id);
      this.updateAppliedFilters("brands", value.brandName);
    }
    this.filterObj.vehicelBrandId = brandIds;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true; //Changes made by Hamza
  }
  kmsChange() {
    var kms = [];
    kms.push(Number(this.fromKms));
    kms.push(Number(this.toKms));
    this.filterObj.kmDriven = kms;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("kms", this.formatKms(this.fromKms) + " - " + this.formatKms(this.toKms));
    this.filtersSelected = true; //Changes made by Hamza
  }
  onFuelSelect(event: any) {
    let fuelIds = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'fuel');
    for (let value of event.value) {
      fuelIds.push(value.id);
      this.updateAppliedFilters("fuel", value.label);
    }
    this.filterObj.fuelType = fuelIds;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true; //Changes made by Hamza
  }
  onTransmissionSelect(event: any) {
    let transmissionIds = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'transmission');
    for (let value of event.value) {
      transmissionIds.push(value.id);
      this.updateAppliedFilters("transmission", value.label);
    }
    this.filterObj.transmissionType = transmissionIds;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true; //Changes made by Hamza
  }
  yearChange() {
    var year = [];
    year.push(Number(this.fromYear));
    year.push(Number(this.toYear));
    this.filterObj.year = year;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("year", year[0] + " - " + year[1]);
    this.filtersSelected = true; //Changes made by Hamza
  }
  onOwnerSelect(event: any) {
    this.filterObj.noOfOwner = event.value;
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'noOfOwner');
    for (let value of event.value) {
      this.updateAppliedFilters("noOfOwner", value);
    }
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true; //Changes made by Hamza
  }
  removeItem(item: any): void {
    if (item.name == 'state') {
      const cityIndex = this.appliedFilters.findIndex((item: any) => item.name == 'city');
      if (cityIndex >= 0) {
        this.appliedFilters.splice(cityIndex, 1);
      }
    }
    if (item.name == 'state' || item.name == 'city') {
      const nearByIndex = this.appliedFilters.findIndex((item: any) => item.name == 'nearBy');
      if (nearByIndex >= 0) {
        this.appliedFilters.splice(nearByIndex, 1);
      }
    }
    const index = this.appliedFilters.indexOf(item);
    if (index >= 0) {
      this.appliedFilters.splice(index, 1);
      this.updateFilterColumns(item);
    }
  }
  formatAmount(amount: number): string {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  formatKms(amount: number): string {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  updateAppliedFilters(filterName: string, value: any) {
    let matchFound = false;
    for (let i = 0; i < this.appliedFilters.length; i++) {
      if (this.appliedFilters[i].name == filterName && (filterName == 'state' || filterName == 'city' || filterName == 'nearBy' || filterName == 'price' || filterName == 'kms')) {
        matchFound = true;
        (value == null) ? this.appliedFilters.splice(i, 1) : this.appliedFilters[i].value = value;
        break;
      }
    }
    if (!matchFound)
      this.appliedFilters.push({ name: filterName, value: value })
  }
  displayLocation(brand: any): string {
    return brand?.name || "";
  }
  getFilteredStates() {
    this.filteredStates = this.stateControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.districts))
    );
  }
  filterLocations(value: any, dataArray: any[]): { id: number; name: string }[] {
    var filterValue = "";
    if (typeof value == 'object')
      filterValue = value.name.toLowerCase();
    else
      filterValue = value.toLowerCase();
    return dataArray.filter(
      (data: any) => data.name.toLowerCase().indexOf(filterValue) === 0
    );
  }
  updateFilterColumns(filter: any) {
    switch (filter.name) {
      case "brands":
        this.removeOptionFromArray(this.brandMultiSelect, (this.filterObj.vehicelBrandId || []), "brandName", filter.value);
        break;
      case "noOfOwner":
        this.removeOptionFromArray(this.ownerMultiSelect, (this.filterObj.noOfOwner || []), null, filter.value);
        break;
      case "fuel":
        this.removeOptionFromArray(this.fuelMultiSelect, (this.filterObj.fuelType || []), "label", filter.value);
        break;
      case "transmission":
        this.removeOptionFromArray(this.transMultiSelect, (this.filterObj.transmissionType || []), "label", filter.value);
        break;
      case "state":
        this.resetFilters();
        break;
      case "city":
        this.resetCityAndNearby();
        break;
      case "nearBy":
        this.resetNearBy();
        break;
      case "price":
        this.resetPrice();
        break;
      case "kms":
        this.resetKms();
        break;
      case "year":
        this.resetYear();
        break;
    }
    this.commonService.setData(this.filterObj);
  }

  removeOptionFromArray(select: any, dataArray: any[], key: string | null, value: any) {
    const selectedOptions = select.value as any[];
    const index = selectedOptions.findIndex((option: any) => {
      if (key) {
        return option[key].toLowerCase() === value.toLowerCase();
      } else {
        return option === value;
      }
    });

    const deleteIndex = dataArray?.indexOf(selectedOptions[index].id);
    if (deleteIndex !== -1 && deleteIndex !== undefined) {
      dataArray?.splice(deleteIndex, 1);
    }
    if (index !== -1) {
      selectedOptions.splice(index, 1);
      select.writeValue(selectedOptions);
    }
  }

  clearFilters() {
    window.location.reload();
    this.resetFilters();
    this.filtersSelected = false;
    this.stateControl.patchValue("");
    this.cityControl.patchValue("");
    this.nearByControl.patchValue("");
    this.fromPrice = 0;
    this.toPrice = 0;
    this.selectedBrand = '';
    this.fromKms = 0;
    this.toKms = 0;
    this.fromYear = null;
    this.toYear = null;
    this.filterObj = { ...this.initialFilters }; // Reset to initial filters
    this.appliedFilters = [];
    this.ownerMultiSelect.writeValue([]);
    this.fuelMultiSelect.writeValue([]);
    this.transMultiSelect.writeValue([]);
    this.resetClicked.emit();
  }

  closeFilters(){
    this.resetClicked.emit();
  }


  resetFilters() {
    this.stateControl.patchValue("");
    this.cityControl.patchValue("");
    this.nearByControl.patchValue("");
    this.stateAutocomplete.options.forEach(option => option.deselect());
    this.filterObj.state = null;
    this.filterObj.city = null;
    this.filterObj.nearBy = null;
    // window.location.reload();
  }

  resetCityAndNearby() {
    this.cityControl.patchValue("");
    this.nearByControl.patchValue("");
    this.cityAutocomplete.options.forEach(option => option.deselect());
    this.filterObj.city = null;
    this.filterObj.nearBy = null;
  }

  resetNearBy() {
    this.nearByControl.patchValue("");
    this.filterObj.nearBy = null;
    this.nearByAutocomplete.options.forEach(option => option.deselect());
  }

  resetPrice() {
    this.fromPrice = 0;
    this.toPrice = 0;
    this.filterObj.price = null;
  }

  resetKms() {
    this.fromKms = 0;
    this.toKms = 0;
    this.filterObj.kmDriven = null;
  }

  resetYear() {
    this.fromYear = null;
    this.toYear = null;
    this.filterObj.year = null;
  }
  getFilteredCities() {
    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.cities))
    );
  }
  getFilteredNearBy() {
    this.filteredNearBy = this.nearByControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.nearByPlaces))
    );
  }
  getNearByPlaces(cityId: Number) {
    this.commonService.getNearPlacesByCity(cityId).subscribe(data => {
      this.nearByPlaces = data;
      this.getFilteredNearBy();
    })
  }
}
