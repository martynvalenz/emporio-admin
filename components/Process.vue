<template>
    <div>
        <v-dialog v-model="service_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-form>
				<v-card>
                    <v-system-bar color="primary" dark height="60px;">
                        <h2>Editar Proceso</h2>
                        <v-spacer></v-spacer>
                        <v-btn icon small @click="service_dialog = false"><v-icon color="white">close</v-icon></v-btn>
                    </v-system-bar>
					<v-card-text class="mb-4">
                        <v-container>
                            <v-simple-table class="elevation-4"> 
                                <thead>
                                    <tr>
                                        <th class="text-left" style="width:10%">Orden</th>
                                        <th class="text-left" style="width:28%">Requisito</th>
                                        <th class="text-left" style="width:15%">Categoría</th>
                                        <th class="text-center" style="width:8%">Venta</th>
                                        <th class="text-center" style="width:8%">Operaciones</th>
                                        <th class="text-center" style="width:8%">Gestión</th>
                                        <th class="text-center" style="width:8%">Registro</th>
                                        <th class="text-center" style="width:10%">Creado</th>
                                        <th class="text-right" style="width:5%"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(reg, index) in service_requisites" :key="index">
                                        <td>{{ index + 1 }} <!-- <span><v-icon>keyboard_arrow_up</v-icon><v-icon>keyboard_arrow_down</v-icon></span> --></td>
                                        <td>{{ reg.requisite }}</td>
                                        <td>
                                            <span v-if="reg.category == 0">Dirección</span>
                                            <span v-if="reg.category == 1">Jurídico</span>
                                            <span v-if="reg.category == 2">Administración</span>
                                            <span v-if="reg.category == 3">Gestión</span>
                                            <span v-if="reg.category == 4">Operaciones</span>
                                            <span v-if="reg.category == 5">Soporte</span>
                                            <span v-if="reg.category == 6">Auditoría</span>
                                            <span v-if="reg.category == 7">Ventas</span>
                                        </td>
                                        <td class="text-center">
                                            <v-icon v-if="reg.sales" color="green">fiber_manual_record</v-icon>
                                            <v-icon v-else color="grey lighten-2" @click="Sales(index)">fiber_manual_record</v-icon>
                                        </td>
                                        <td class="text-center">
                                            <v-icon v-if="reg.operations" color="green">fiber_manual_record</v-icon>
                                            <v-icon v-else color="grey lighten-2">fiber_manual_record</v-icon>
                                        </td>
                                        <td class="text-center">
                                            <v-icon v-if="reg.management" color="green">fiber_manual_record</v-icon>
                                            <v-icon v-else color="grey lighten-2">fiber_manual_record</v-icon>
                                        </td>
                                        <td class="text-center">
                                            <v-icon v-if="reg.register" color="green">fiber_manual_record</v-icon>
                                            <v-icon v-else color="grey lighten-2">fiber_manual_record</v-icon>
                                        </td>
                                        <td class="text-center">{{ reg.created_at }}</td>
                                        <td class="text-right">
                                            <v-icon color="red" @click="deleteRequisite(index)">cancel</v-icon>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-simple-table>
                        </v-container>
                        <br>
                        <hr>
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="12" md="7" lg="6">
									<v-text-field v-model="requisite" label="Proceso" outlined :error-messages="errors.requisite"></v-text-field>
								</v-col>
                                <v-col cols="12" sm="12" md="7" lg="3">
									<v-select v-model="category" label="Área" :items="categories" item-value="value" item-text="category" outlined :error-messages="errors.category"></v-select>
								</v-col>
                                <v-col cols="12" sm="12" md="7" lg="3">
                                    <v-checkbox v-model="status" color="primary" label="Estatus" :error-messages="errors.status"></v-checkbox>
								</v-col>
							</v-row>
                            <v-row>
								<v-btn class="mx-1" color="success" :loading="loading" @click="Save">Guardar<v-icon right>save</v-icon></v-btn>
                                <v-btn class="mx-1" color="grey" dark @click="cancel">Cancelar</v-btn>
							</v-row>
						</v-container>
                        <br>
                        <hr>
                        <v-container>
                            <v-layout row wrap>
                                <v-flex xs12 sm12 md6 lg4 xl3 v-for="(requirement, index) in requisites" :key="index" class="px-3">
                                    <span v-if="requirement.category == 0">Dirección</span>
                                    <span v-if="requirement.category == 1">Jurídico</span>
                                    <span v-if="requirement.category == 2">Administración</span>
                                    <span v-if="requirement.category == 3">Gestión</span>
                                    <span v-if="requirement.category == 4">Operaciones</span>
                                    <span v-if="requirement.category == 5">Soporte</span>
                                    <span v-if="requirement.category == 6">Auditoría</span>
                                    <span v-if="requirement.category == 7">Ventas</span>
                                    <v-icon @click="edit(index)" v-if="requirement.status == 0" :color="requirement.color">check</v-icon>
                                    <v-switch :color="requirement.color" v-bind:class="[requirement.status == 0 ? 'inactive':'']" :value="requirement.selected" :input-value="requirement.selected" :label="requirement.requisite" inset append-icon="edit" @click:append="edit(index)" @change="Switch(index)" :disabled="requirement.status == 0"></v-switch>
                                </v-flex>
                            </v-layout>
                        </v-container>
					</v-card-text>
                    <br>
                    <div class="pt-4"></div>
					<v-card-actions style="background-color:rgba(0,0,0,0.1); color: white; position:absolute; bottom: 0; width:100%;">
						<v-spacer></v-spacer>
						<v-btn text @click="service_dialog = false">Cerrar</v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
        <v-snackbar
            v-model="snackbar"
            :timeout="timeout"
            top
            center
            :color="snackColor"
            >
            {{ snackText }}
        </v-snackbar>
    </div>
</template>

<script>
export default {
    data(){
        return{
            //DAta
            service_dialog:false,
            loading:false,
            errors:[],
            selected_requirement:'',
            requirement_id:'',
            service_catalog_id:'',
            requisite:'',
            status:0,
            category:'',
            categories:[
                {value:0, category:'Dirección'},
                {value:1, category:'Jurídico'},
                {value:2, category:'Administración'},
                {value:3, category:'Gestión'},
                {value:4, category:'Operaciones'},
                {value:5, category:'Soporte'},
                {value:6, category:'Auditoría'},
                {value:7, category:'Ventas'},
            ],
            requisites:[],
            service_requisites:[],
            //snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    methods:{
        openProcess(service_id){
            this.service_dialog = true;
            this.service_catalog_id = service_id;
            this.getRequisites();
            this.serviceRequisites();
        },

        async getRequisites(){
            await this.$axios.get(`/api/catalog-requisites/${this.service_catalog_id}`)
            .then(res => {
                this.requisites = res.data;
            })
        },

        async serviceRequisites(){
            await this.$axios.get(`/api/catalog-service-requisites/${this.service_catalog_id}`)
            .then(res => {
                this.service_requisites = res.data;
            })
        },

        edit(index){
            const requisites = this.requisites[index];
			this.selected_requirement = index;
            this.requirement_id = requisites.id;
            this.requisite = requisites.requisite;
            this.status = requisites.status;
            this.category = requisites.category * 1;
        },

        cancel(){
            this.selected_requirement = '';
            this.requirement_id = '';
            this.requisite = '';
            this.status = '';
            this.category = '';
        },

        async Save(){
            this.loading = true;
            if(this.requirement_id){
                await this.$axios.put(`/api/catalog-requirement/update/${this.requirement_id}`, {requisite:this.requisite, category:this.category, status:this.status, services_catalog_id:this.service_catalog_id})
                .then(res => {
                    this.requisites[this.selected_requirement] = res.data;
                    this.cancel();
                    this.errors = {};
                    this.loading = false;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.loading = false;
                })
            }
            else{
                await this.$axios.post('/api/catalog-requirement/store', {requisite:this.requisite, category:this.category, status:this.status, services_catalog_id:this.service_catalog_id})
                .then(res => {
                    this.requisites.unshift(res.data);
                    this.cancel();
                    this.errors = {};
                    this.loading = false;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.loading = false;
                })
            }
        },

        Sales(index){
            
        },

        async Switch(index){
            // console.log(this.requisites[index]);
            const requi = this.requisites[index];
            let selected = 1;
            if(requi.selected === 1){
                selected = 0;
            }
            else if(requi.selected === 0){
                selected = 1;
            }
            await this.$axios.put(`/api/catalog-requisite/switch/${requi.id}`, {selected:selected, requirement_id:requi.id, services_catalog_id:this.service_catalog_id})
            .then(res => {
                this.serviceRequisites();
                this.requisites[index] = res.data.requi;
                this.$emit('updateProcess', res.data.count);
            })
            .catch(error => {
                console.log(error);
            })
        },

        async deleteRequisite(index){
            const requi = this.service_requisites[index];
            let selected = 0;
            await this.$axios.put(`/api/catalog-requisite/switch/${requi.id}`, {selected:selected, requirement_id:requi.requirement_id, services_catalog_id:requi.services_catalog_id})
            .then(res => {
                this.service_requisites.splice(index, 1);
                this.$emit('updateProcess', res.data.count);
                this.getRequisites();
            })
            .catch(error => {
                console.log(error);
            })
        }
    }
}
</script>

<style>
    ul {
		list-style-type: none;
        
	}

	li{
		text-align: center !important;
        display:inline;
        padding-left: 5px;
        padding-right: 5px;
	}

    .inactive{
        text-decoration: line-through;
        font-style: italic;
        color:grey;
    }

    
</style>