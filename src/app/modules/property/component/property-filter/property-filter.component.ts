import { Component, ViewChild, ElementRef, Renderer2, HostListener, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSelectionList } from '@angular/material/list';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Observable, startWith, map } from 'rxjs';
import { ConstructionStatus } from 'src/app/shared/enum/ConstructionStatus';
import { FacingType } from 'src/app/shared/enum/FacingType';
import { FurnishingStatus } from 'src/app/shared/enum/FurnishingStatus';
import { HouseType } from 'src/app/shared/enum/HouseType';
import { ListedBy } from 'src/app/shared/enum/ListBy';
import { PGType } from 'src/app/shared/enum/PGType';
import { PropertyType } from 'src/app/shared/enum/PropertyType';
import { ServiceType } from 'src/app/shared/enum/ServiceType';
import { Filter } from 'src/app/shared/model/Filter';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-property-filter',
  templateUrl: './property-filter.component.html',
  styleUrls: ['./property-filter.component.css']
})
export class PropertyFilterComponent {

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
  fromPrice = 0;
  toPrice = 0;
  fromBuildUpArea = 0;
  toBuildUpArea = 0;
  fromPlotArea = 0;
  toPlotArea = 0;
  subCategory: any;
  mainCategory: string = "";
  filterObj = new Filter();
  appliedFilters: any = [];
  @ViewChild('houseTypeMultiSelect') houseTypeMultiSelect!: MatSelect;
  @ViewChild('subTypeMultiSelect') subTypeMultiSelect!: MatSelect;
  @ViewChild('serviceTypeMultiSelect') serviceTypeMultiSelect!: MatSelect;
  @ViewChild('furnishingMultiSelect') furnishingMultiSelect!: MatSelect;
  @ViewChild('constructionMultiSelect') constructionMultiSelect!: MatSelect;
  @ViewChild('listedByMultiSelect') listedByMultiSelect!: MatSelect;

  @ViewChild('stateMatAutocomplete') stateAutocomplete!: MatAutocomplete;
  @ViewChild('cityMatAutocomplete') cityAutocomplete!: MatAutocomplete;
  @ViewChild('nearByMatAutocomplete') nearByAutocomplete!: MatAutocomplete;
  @ViewChild(MatSelectionList)
  matSelectionList!: MatSelectionList;

  //Changes made by Hamza
  filtersSelected: boolean = false;
  initialFilters: any;
  selectedHouseType: any;
  selectedFurnishing: any;
  selectedConstructionStatus: any;
  selectedListedBy: any;
  selectedPgType: any;
  selectedServiceType: any;
  selectedBathRoomNumber: any;
  selectedBedRoomNumber: any;
  selectedBachelorsAllowed: any;
  numberOfBedRooms = [1, 2, 3, 4];
  numberOfBathRooms = [1, 2, 3, 4];
  houseTypes = Object.keys(HouseType).map((key: any) => ({
    label: key,
    id: HouseType[key],
  }));
  furnishingStatus = Object.keys(FurnishingStatus).map((key: any) => ({
    label: key,
    id: FurnishingStatus[key],
  }));
  constructionStatus = Object.keys(ConstructionStatus).map((key: any) => ({
    label: key,
    id: ConstructionStatus[key],
  }));
  listedBy = Object.keys(ListedBy).map((key: any) => ({
    label: key,
    id: ListedBy[key],
  }));
  facingTypes = Object.keys(FacingType).map((key: any) => ({
    label: key,
    id: FacingType[key],
  }));
  serviceTypes = Object.keys(ServiceType).map((key: any) => ({
    label: key,
    id: ServiceType[key],
  }));
  pgTypes = Object.keys(PGType).map((key: any) => ({
    label: key,
    id: PGType[key],
  }));
  houseApartmentsSale = ['houseType', 'bedrooms', 'bathrooms', 'furnishing', 'constructionStatus', 'listedBy', 'superBuildUpArea', 'projectName'];
  houseApartmentsRent = ['houseType', 'bedrooms', 'bathrooms', 'furnishing', 'constructionStatus', 'listedBy', 'superBuildUpArea', 'bachelorAllowed',];
  landsAndPlots = ['serviceType', 'listedBy', 'plotArea'];
  shopsAndOfcRent = ['furnishing', 'listedBy', 'superBuildUpArea'];
  shopsAndOfcSale = ['furnishing', 'constructionStatus', 'listedBy', 'superBuildUpArea'];
  pgAndGuestHouses = ['subType', 'furnishing', 'listedBy'];
  propertiesToShow: any = [];
  bachelorsAllowed = [{ label: 'No', value: false }, { label: 'Yes', value: true }];
  constructor(private commonService: CommonService, private route: ActivatedRoute, private renderer: Renderer2) { }


  ngOnInit() {
    this.houseTypes = this.houseTypes.slice(this.houseTypes.length / 2);
    this.furnishingStatus = this.furnishingStatus.slice(this.furnishingStatus.length / 2);
    this.constructionStatus = this.constructionStatus.slice(this.constructionStatus.length / 2);
    this.facingTypes = this.facingTypes.slice(this.facingTypes.length / 2);
    this.listedBy = this.listedBy.slice(this.listedBy.length / 2);
    this.serviceTypes = this.serviceTypes.slice(this.serviceTypes.length / 2);
    this.pgTypes = this.pgTypes.slice(this.pgTypes.length / 2);
    this.commonService.getCountry().subscribe((data: any) => {
      this.country = data[0];
      this.getAllStates();
    });
    this.route.queryParams.subscribe((params: any) => {
      this.subCategory = params.sub;
      if (this.subCategory != undefined) {
        this.filterObj.subCategoryId = Number(params.sub);
        this.houseApartmentsSale = ['houseType', 'bedrooms', 'bathrooms', 'furnishing', 'constructionStatus', 'listedBy', 'superBuildUpArea', 'projectName'];
        this.houseApartmentsRent = ['houseType', 'bedrooms', 'bathrooms', 'furnishing', 'constructionStatus', 'listedBy', 'superBuildUpArea', 'bachelorAllowed',];
        this.landsAndPlots = ['serviceType', 'listedBy', 'plotArea'];
        this.shopsAndOfcRent = ['furnishing', 'listedBy', 'superBuildUpArea'];
        this.shopsAndOfcSale = ['furnishing', 'constructionStatus', 'listedBy', 'superBuildUpArea'];
        this.pgAndGuestHouses = ['subType', 'furnishing', 'listedBy'];
      }
      else {
        this.houseApartmentsSale = [];
        this.houseApartmentsRent = [];
        this.landsAndPlots = [];
        this.shopsAndOfcRent = [];
        this.shopsAndOfcSale = [];
        this.pgAndGuestHouses = [];
      }
      this.selectRequiredFilters();
    });
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
  updateAppliedFilters(filterName: string, value: any) {
    let matchFound = false;
    let singleSelectionFilters = ['state', 'city', 'nearBy', 'price', 'bathrooms', 'bedrooms', 'superBuildUpArea', 'plotArea', 'bachelorAllowed']
    for (let i = 0; i < this.appliedFilters.length; i++) {
      if (this.appliedFilters[i].name == filterName && singleSelectionFilters.includes(filterName)) {
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
      case "houseType":
        this.removeOptionFromArray(this.houseTypeMultiSelect, (this.filterObj.houseType || []), "label", filter.value);
        break;
      case "pgType":
        this.removeOptionFromArray(this.subTypeMultiSelect, (this.filterObj.pgType || []), "label", filter.value);
        break;
      case "serviceType":
        this.removeOptionFromArray(this.serviceTypeMultiSelect, (this.filterObj.serviceType || []), "label", filter.value);
        break;
      case "furnishingStatus":
        this.removeOptionFromArray(this.furnishingMultiSelect, (this.filterObj.furnishingStatus || []), "label", filter.value);
        break;
      case "constructionStatus":
        this.removeOptionFromArray(this.constructionMultiSelect, (this.filterObj.constructionStatus || []), "label", filter.value);
        break;
      case "listedBy":
        this.removeOptionFromArray(this.listedByMultiSelect, (this.filterObj.listedBy || []), "label", filter.value);
        break;
      case "bedrooms":
        this.resetBedrooms();
        break;
      case "bathrooms":
        this.resetBathrooms();
        break;
      case "superBuildUpArea":
        this.resetSuperBuildUpArea();
        break;
      case "plotArea":
        this.resetPlotArea();
        break;
      case "bachelorAllowed":
        this.resetBachelorAllowed();
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
    this.resetFilters();
    this.filtersSelected = false;
    this.stateControl.patchValue("");
    this.cityControl.patchValue("");
    this.nearByControl.patchValue("");
    this.fromPrice = 0;
    this.toPrice = 0;
    this.filterObj = { ...this.initialFilters }; // Reset to initial filters
    this.appliedFilters = [];
    this.resetClicked.emit();
    window.location.reload();
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
  onBedRoomSelect(event: any) {
    this.filterObj.bedrooms = event.value;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("bedrooms", this.filterObj.bedrooms);
    this.filtersSelected = true;
  }
  onBathRoomSelect(event: any) {
    this.filterObj.bathrooms = event.value;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("bathrooms", this.filterObj.bathrooms);
    this.filtersSelected = true;
  }
  onHouseTypeSelect(event: any) {
    var houseTypes = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'houseType');
    for (let value of event.value) {
      houseTypes.push(value.id);
      this.updateAppliedFilters("houseType", value.label);
    }
    this.filterObj.houseType = houseTypes;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true;
  }
  onFurnishingSelect(event: any) {
    var furnishingStatus = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'furnishingStatus');
    for (let value of event.value) {
      furnishingStatus.push(value.id);
      this.updateAppliedFilters("furnishingStatus", value.label);
    }
    this.filterObj.furnishingStatus = furnishingStatus;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true;
  }
  onBedBachelorsAllowedSelect(event: any) {
    this.filterObj.bachelorAllowed = event.value.value;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("bachelorAllowed", event.value.label);
    this.filtersSelected = true;
  }
  onConstructionStatusSelect(event: any) {
    var constructionStatus = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'constructionStatus');
    for (let value of event.value) {
      constructionStatus.push(value.id);
      this.updateAppliedFilters("constructionStatus", value.label);
    }
    this.filterObj.constructionStatus = constructionStatus;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true;
  }
  onListedBySelect(event: any) {
    var listedBy = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'listedBy');
    for (let value of event.value) {
      listedBy.push(value.id);
      this.updateAppliedFilters("listedBy", value.label);
    }
    this.filterObj.listedBy = listedBy;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true;
  }
  onServiceTypeSelect(event: any) {
    var serviceType = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'serviceType');
    for (let value of event.value) {
      serviceType.push(value.id);
      this.updateAppliedFilters("serviceType", value.label);
    }
    this.filterObj.serviceType = serviceType;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true;
  }
  onPgTypeSelect(event: any) {
    var pgType = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'pgType');
    for (let value of event.value) {
      pgType.push(value.id);
      this.updateAppliedFilters("pgType", value.label);
    }
    this.filterObj.pgType = pgType;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true;
  }
  buildUpAreaChange() {
    let buildUpArea = [];
    buildUpArea.push(Number(this.fromBuildUpArea));
    buildUpArea.push(Number(this.toBuildUpArea));
    this.filterObj.superBuildUpArea = buildUpArea;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("superBuildUpArea", this.formatAmount(this.fromBuildUpArea) + " - " + this.formatAmount(this.toBuildUpArea));
    this.filtersSelected = true; //Changes made by Hamza
  }
  plotAreaChange() {
    let plotArea = [];
    plotArea.push(Number(this.fromPlotArea));
    plotArea.push(Number(this.toPlotArea));
    this.filterObj.plotArea = plotArea;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("plotArea", this.formatAmount(this.fromPlotArea) + " - " + this.formatAmount(this.toPlotArea));
    this.filtersSelected = true; //Changes made by Hamza
  }
  selectRequiredFilters() {
    switch (this.filterObj.subCategoryId) {
      case PropertyType.ForRentHousesApartments: {
        this.propertiesToShow = this.houseApartmentsRent;
        break;
      }
      case PropertyType.ForSaleHousesApartments: {
        this.propertiesToShow = this.houseApartmentsSale;
        break;
      }
      case PropertyType.LandsAndPlot: {
        this.propertiesToShow = this.landsAndPlots;
        break;
      }
      case PropertyType.ForRentShopOffices: {
        this.propertiesToShow = this.shopsAndOfcRent;
        break;
      }
      case PropertyType.ForSaleShopsOffices: {
        this.propertiesToShow = this.shopsAndOfcSale;
        break;
      }
      case PropertyType.PGAndGuestHouses: {
        this.propertiesToShow = this.pgAndGuestHouses;
        break;
      }
    }
  }
  resetBedrooms() {
    this.selectedBedRoomNumber = null;
    this.filterObj.bedrooms = null;
  }
  resetBathrooms() {
    this.selectedBathRoomNumber = null;
    this.filterObj.bathrooms = null;
  }
  resetSuperBuildUpArea() {
    this.fromBuildUpArea = 0;
    this.toBuildUpArea = 0;
    this.filterObj.superBuildUpArea = null;
  }
  resetPlotArea() {
    this.fromPlotArea = 0;
    this.toPlotArea = 0;
    this.filterObj.plotArea = null;
  }
  resetBachelorAllowed() {
    this.filterObj.bachelorAllowed = null;
    this.selectedBachelorsAllowed = null;
  }
}
