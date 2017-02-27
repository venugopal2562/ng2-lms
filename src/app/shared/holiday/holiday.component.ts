import { Component, OnInit } from '@angular/core';
import { HolidayService } from '../../service/holiday.service';

@Component({
    selector: 'lms-holiday',
    templateUrl: 'holiday.component.html',
    providers: [HolidayService]
})
export class HolidayComponent implements OnInit {

    itemResource: any;
    items = [];
    itemCount = 0;
    success: string;
    error: string;
    loading: boolean = false;

    constructor(private holidayService: HolidayService) { }

    ngOnInit() {
		this.reloadItems();
	}

    reloadItems() {
        this.holidayService.listHolidays().subscribe(res => {
			this.items = res.data,
			this.itemCount = res.data.length
		});
    }

    rowTooltip(item) { return item.firstname; }
	
	deleteUser(item) {
        this.loading = true;
        this.holidayService.deleteHoliday(item._id).subscribe(
			data => {
                this.loading = false;
                if(data.success){
                    this.success = data.msg;
                }else{
                    this.error = data.msg;
                }
                this.loading = false;
            },
            error => {
            this.error = error.msg;
            this.loading = false;
        });	
        this.reloadItems();
    }
}