import { Component, OnInit } from '@angular/core';
import { DataTableResource } from 'angular-2-data-table';
import { LeavesService } from '../../service/leaves.service';

@Component({
    selector: 'lms-myleave',
    templateUrl: 'myleave.component.html',
    providers: [LeavesService]
})
export class MyleaveComponent implements OnInit {
    
    itemResource: any;
    items = [];
    itemCount = 0;
    success: string;
    error: string;
    loading: boolean = false;

    constructor(private leavesService: LeavesService) { }

    ngOnInit() {
		this.reloadItems();
	}
	
    reloadItems() {
        this.leavesService.listLeaves().subscribe(res => {
			this.items = res.data,
			this.itemCount = res.data.length
		});
    }

    rowTooltip(item) { return item.leavetype; }
	
	deleteLeave(item) {
        this.loading = true;
        this.leavesService.deleteLeave(item._id).subscribe(
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