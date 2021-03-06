import { Component, OnInit, Directive, ViewChild} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataTableResource } from 'angular-2-data-table';
import { LeavesService } from '../../service/leaves.service';
import { UserService } from '../../service/user.service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
    selector: 'lms-pandingleave',
    templateUrl: 'pandingleave.component.html',
    providers: [UserService, LeavesService]
})
export class PandingleaveComponent implements OnInit {
    
    itemResource: any;
    items = [];
    itemCount = 0;
    success: string;
    error: string;
    isAdmin: any;
    userid: any;
    loading: boolean = false;
    userData: any;
    modalId: string;
    modalDel: any;
    modalData: any;
    leaveData : any;

    constructor(private fb: FormBuilder, private userService: UserService, private leavesService: LeavesService) {
        // get users from secure api end point
        this.userService.getUser()
            .subscribe(users => {
                this.userid = users.data._id,
                this.isAdmin = users.data.role
            }); 
     }
     

    ngOnInit() {
		//this.reloadItems();
	}
	
    /*reloadItems() {      
        this.userService.getUser()
        .flatMap(user => this.leavesService.listLeavesByManager(user.data))
        .subscribe(res => {
            this.items = res.data,
            this.itemCount = res.data.length
        }); 
    }*/

    reloadItems(params) {
        this.userService.getUser()
        .flatMap(user => this.leavesService.listLeavesByManager(user.data, params))
        .subscribe(res => {
            this.items = res.items,
            this.itemCount = res.count;
        }); 
    }

    rowTooltip(item) { return item.leavetype; }
	
    @ViewChild('modal')
    modal: ModalComponent;

    openDeleteModal(data){
        this.modalDel = data;
        this.modal.open();
    }

	deleteLeave(item) {
        this.loading = true;
        this.leavesService.deleteLeave(item._id).subscribe(
			data => {
                this.loading = false;
                if(data.success){
                    this.modalDel = null;
                    this.modal.close();
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
        //this.reloadItems();
    }

    public confirmLeaveForm = this.fb.group({ 
        comment: ["", Validators.required],
        approve_status: ["", Validators.required]
    });

    @ViewChild('modalApprove')
    modalApprove: ModalComponent;

    openConfirmLeaveModal(data){
        this.modalId = data._id;
        this.modalApprove.open();
    }

    confirmLeaveSubmitForm() {
        this.loading = true;
        this.error = "";
		this.success = "";
        this.confirmLeaveForm.value.id = this.modalId;
        this.leaveCalculation(this.confirmLeaveForm.value);
        /*this.leavesService.confirmLeave(this.confirmLeaveForm.value).subscribe(
			data => {
                this.loading = false;
                if(data.success){
                    this.modalApprove.close();
                    this.success = data.msg;
                }else{
                    this.error = data.msg;
                }
                this.loading = false;
            },
            error => {
            this.error = error.msg;
            this.loading = false;
        });*/	
        //this.reloadItems();
    }

    leaveCalculation(formdata){
        if(formdata.approve_status==1){

            this.leavesService.getLeaves(formdata.id)
            .flatMap(ret => this.leavesService.addCountLeave(ret.data.userid))
            .subscribe(res => {
                if(res.success){
                    
                }else{
                    this.error = res.msg;
                }
            }); 


            this.leavesService.getLeaves(formdata.id).subscribe(data => { this.leaveData = data.data });
            this.leavesService.addCountLeave( this.leaveData.userid).subscribe(
                data => {
                    if(data.success){
                       
                    }else{
                        this.error = data.msg;
                    }
                });
        }
    }


    @ViewChild('modalView')
    modalView: ModalComponent;

    openViewModal(data){
        this.leavesService.getLeaves(data._id).subscribe(
			data => {
                this.loading = false;
                if(data.success){
                    this.modalData = data.data;
                }else{
                    this.error = data.msg;
                }
            },
            error => {
            this.error = error.msg;
        });	

        this.modalView.open();
    }

    closeModal(){
        this.modal.close();
        this.modalView.close();
    }

}