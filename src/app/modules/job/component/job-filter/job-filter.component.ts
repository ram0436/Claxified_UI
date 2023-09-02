import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSelectionList } from '@angular/material/list';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Observable, startWith, map } from 'rxjs';
import { PositionType } from 'src/app/shared/enum/PositionType';
import { SalaryPeriod } from 'src/app/shared/enum/SalaryPeriod';
import { Filter } from 'src/app/shared/model/Filter';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-job-filter',
  templateUrl: './job-filter.component.html',
  styleUrls: ['./job-filter.component.css']
})
export class JobFilterComponent {

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
  subCategory: any;
  mainCategory: string = "";
  filterObj = new Filter();
  appliedFilters: any = [];
  @ViewChild('stateMatAutocomplete') stateAutocomplete!: MatAutocomplete;
  @ViewChild('cityMatAutocomplete') cityAutocomplete!: MatAutocomplete;
  @ViewChild('nearByMatAutocomplete') nearByAutocomplete!: MatAutocomplete;
  @ViewChild(MatSelectionList)
  matSelectionList!: MatSelectionList;
  @ViewChild('salaryPeriodMultiSelect') salaryPeriodMultiSelect!: MatSelect;
  @ViewChild('positionTypeMultiSelect') positionTypeMultiSelect!: MatSelect;
  //Changes made by Hamza
  filtersSelected: boolean = false; 
  initialFilters: any;

  salaryPeriods = Object.keys(SalaryPeriod).map((key: any) => ({
    label: key,
    id: SalaryPeriod[key],
  }));
  positionTypes = Object.keys(PositionType).map((key: any) => ({
    label: key,
    id: PositionType[key],
  }));
  selectedPositionType : any;
  selectedSalaryPeriod : any;
  constructor(private commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.salaryPeriods = this.salaryPeriods.slice(this.salaryPeriods.length / 2);
    this.positionTypes = this.positionTypes.slice(this.positionTypes.length / 2);

    this.commonService.getCountry().subscribe((data: any) => {
      this.country = data[0];
      this.getAllStates();
    });
    this.route.queryParams.subscribe((params: any) => {
      this.subCategory = params.sub;
      if(this.subCategory !=undefined)
      this.filterObj.subCategoryId = Number(params.sub);
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
      case "state":
        this.resetFilters();
        break;
      case "city":
        this.resetCityAndNearby();
        break;
      case "nearBy":
        this.resetNearBy();
        break;
      case "salaryPeriodType":
        this.removeOptionFromArray(this.salaryPeriodMultiSelect, (this.filterObj.salaryPeriodType || []), "label", filter.value);
        break;
        break;
      case "positionType":
        this.removeOptionFromArray(this.positionTypeMultiSelect, (this.filterObj.positionType || []), "label", filter.value);
        break;
    }
    console.log(this.filterObj);
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
    window.location.reload();
  }

  resetFilters() {
    this.stateControl.patchValue("");
    this.cityControl.patchValue("");
    this.nearByControl.patchValue("");
    this.stateAutocomplete.options.forEach(option => option.deselect());
    this.filterObj.state = null;
    this.filterObj.city = null;
    this.filterObj.nearBy = null;
    this.filterObj.salaryPeriodType = null;
    this.filterObj.positionType = null;
    this.selectedPositionType = null;
    this.selectedSalaryPeriod = null;
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
  onSalaryPeriodSelect(event:any){
    var salaryPeriodTypes = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'salaryPeriodType');
    for (let value of event.value) {
      salaryPeriodTypes.push(value.id);
      this.updateAppliedFilters("salaryPeriodType", value.label);
    }
    this.filterObj.salaryPeriodType = salaryPeriodTypes;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true;
  }
  onPositionTypeSelect(event:any){
    var positionTypes = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'positionType');
    for (let value of event.value) {
      positionTypes.push(value.id);
      this.updateAppliedFilters("positionType", value.label);
    }
    this.filterObj.positionType = positionTypes;
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true;
  }
}
