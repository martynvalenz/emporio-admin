<template>
    <div>
        <v-dialog v-model="comissions_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
            <v-card>
                <v-system-bar color="primary" dark height="60px;">
                    <h2>Comisiones</h2>
                    <v-spacer></v-spacer>
                    <v-btn icon small @click="comissions_dialog = false"><v-icon color="white">close</v-icon></v-btn>
                </v-system-bar>
                <v-card-text>
                    <v-container fluid>
                        <v-row>
                            <v-col cols="12" xs="12" sm="12" md="12" lg="8">
                                <v-card class="elevation-0" :loading="comis_loading">
                                    <v-simple-table class="elevation-4">
                                        <thead>
                                            <tr>
                                                <th class="text-left" style="width:25%">Creado</th>
                                                <th class="text-left" style="width:20%">Comisión</th>
                                                <th class="text-right" style="width:20%">Utilizado</th>
                                                <th class="text-right" style="width:20%">Disponible</th>
                                                <th class="text-right" style="width:15%"><v-icon @click="getComis">sync</v-icon></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(comis, index) in comissions_available" :key="index">
                                                <td title="comis.id">{{ comis.created_at }}</td>
                                                <td>
                                                    <span v-if="comis.type == 0">Venta</span>
                                                    <span v-if="comis.type == 1">Operativa</span>
                                                    <span v-if="comis.type == 2">Gestión</span>
                                                </td>
                                                <td class="text-right">{{formatPrice(comis.used)}}</td>
                                                <td class="text-right">{{ formatPrice(comis.available) }}</td>
                                                <td class="text-center">
                                                    <v-btn small fab color="green" dark @click="selectComission(index)"><v-icon>send</v-icon></v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-simple-table>
                                </v-card>
                            </v-col>
                        </v-row>
                        <br>
                        <hr>
                        <br>
                        <v-row>
                            <v-col cols="12" xs="12">
                                <h3>Asignar comisión</h3>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" xs="12" sm="12" md="6" lg="3">
                                <v-select v-model="user_id" outlined :error-messages="errors.user_id" :items="users" item-value="id" item-text="user" clearable label="Seleccionar usuario"></v-select>
                            </v-col>
                            <v-col cols="12" xs="12" sm="12" md="6" lg="2">
                                <v-select v-model="comission_type" :error-messages="errors.comission_type" :items="types" item-value="type" item-text="typer" label="Tipo de comisión" readonly filled></v-select>
                            </v-col>
                            <v-col cols="12" xs="12" sm="12" md="6" lg="2">
                                <v-text-field v-model="comission_percent" :error-messages="errors.comission_percent" outlined type="number" step="any" min="0" :max="available_percent" label="Porcentaje" v-on:keyup="calculateAmmount"></v-text-field>
                            </v-col>
                            <v-col cols="12" xs="12" sm="12" md="6" lg="2">
                                <v-text-field v-model="ammount" :error-messages="errors.ammount" outlined type="number" step="any" min="0" label="Monto" v-on:keyup="calculatePercent" :max="available"></v-text-field>
                            </v-col>
                            <v-col cols="12" xs="12" sm="12" md="6" lg="2">
                                <v-checkbox v-model="apply_comissioner" color="primary" @change="ApplyComissioner" label="Aplicar 20%"></v-checkbox>
                            </v-col>
                        </v-row>
                        <v-row v-if="apply_comissioner">
                            <v-col cols="12" xs="12">
                                <h3>20% Comisión</h3>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" xs="12" sm="12" md="4" lg="3" xl="3" v-if="apply_comissioner">
                                <v-select v-model="comissioner_id" outlined :error-messages="errors.comissioner_id" :items="users" item-value="id" item-text="user" clearable label="Seleccionar usuario 20%"></v-select>
                            </v-col>
                            <v-col cols="12" xs="12" sm="12" md="8" lg="9" xl="9">
                                <v-textarea v-model="comments" outlined label="Comentarios"></v-textarea>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" xs="12">
                                <v-btn color="green" dark :loading="loading" @click="Save">Guardar <v-icon right>save</v-icon></v-btn>
                                <v-btn color="grey" light @click="Cancel">Cancelar</v-btn>
                            </v-col>
                        </v-row>
                        <br>
                        <hr>
                        <br>
                        <v-row v-if="comissions.length > 0">
                            <v-col cols="12" xs="12">
                                <v-card class="elevation-0" :loading="used_loading">
                                    <v-simple-table class="elevation-4">
                                        <thead>
                                            <tr>
                                                <th class="text-left" style="width:15%">Actualizada</th>
                                                <th class="text-left" style="width:20%">Usuario</th>
                                                <th class="text-left" style="width:11%">Tipo</th>
                                                <th class="text-right" style="width:12%">Porcentaje</th>
                                                <th class="text-right" style="width:12%">Comisión</th>
                                                <th class="text-center" style="width:15%">Estatus</th>
                                                <th class="text-right" style="width:15%"><v-icon @click="getUsedComis">sync</v-icon></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(comis, index) in comissions" :key="index">
                                                <td title="comis.id">{{ comis.updated_at }}</td>
                                                <td>{{ comis.name }} {{ comis.last_name }}</td>
                                                <td>
                                                    <span v-if="comis.comission_type == 0">Venta</span>
                                                    <span v-if="comis.comission_type == 1">Operativa</span>
                                                    <span v-if="comis.comission_type == 2">Gestión</span>
                                                </td>
                                                <td class="text-right">{{formatPrice(comis.comission_percent)}}</td>
                                                <td class="text-right">{{ formatPrice(comis.ammount) }}</td>
                                                <td class="text-center">
                                                    <v-chip label small v-if="comis.status == 0" class="warning">Pendiente</v-chip>
                                                    <v-chip label small v-if="comis.status == 1" class="warning">Liberada</v-chip>
                                                    <v-chip label small v-if="comis.status == 2" class="warning">Pagada</v-chip>
                                                    <v-chip label small v-if="comis.status == 3" class="warning">Cancelada</v-chip>
                                                </td>
                                                <td class="text-right">
                                                    <v-btn x-small :disabled="comis.status == 3 || comis.modified == 1"><v-icon color="orange">edit</v-icon></v-btn>
                                                    <v-btn x-small><v-icon color="error">close</v-icon></v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-simple-table>
                                </v-card>
                            </v-col>
                        </v-row>
                        <br>
                    </v-container>
                </v-card-text>
                <v-card-actions style="background-color:rgba(0,0,0,0.1); color: white; position:absolute; bottom: 0; width:100%;">
                    <v-spacer></v-spacer>
                    <v-btn text @click="comissions_dialog = false">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
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
            comissions_dialog:false,
            comis_loading:false,
            loading:false,
            used_loading:false,
            comissions_available:[],
            comissions:[],
            service_control_id:'',
            errors:[],
            users:[],
            available_id:'',
            available:0,
            available_percent:0,
            comission_id:'',
            user_id:'',
            types:[
                {type:0, typer:'Venta'},
                {type:1, typer:'Operativa'},
                {type:2, typer:'Gestión'}
            ],
            selected_comi:'',
            comission_type:'',
            ready:0,
            ammount:0,
            comission_percent:0,
            comissioner_id:'',
            apply_comissioner:false,
            apply_ammount:0,
            comments:'',
            //snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    methods:{
        showComissions(id){
            this.comissions_dialog = true;
            this.service_control_id = id;
            this.getComis();
            this.getUsedComis();
            this.getUsers();
        },

        clearData(){
            this.errors = {};
            this.available_id = '';
            this.comission_id = '';
            this.comission_type = '';
            this.user_id = '';
            this.selected_comi = '';
            this.ammount = '';
            this.comission_percent = '';
            this.comissioner_id = '';
            this.apply_comissioner = false;
            this.apply_ammount = '';
            this.comments = '';
            this.ready = 0;
            this.available = 0;
            this.available_percent = 0;
        },

        async getComis(){
            this.comis_loading = true;
            await this.$axios.get(`/api/comissions-available/${this.service_control_id}`)
            .then(res => {
                this.comissions_available = res.data;
                this.comis_loading = false;
            })
        },

        async getUsedComis(){
            this.used_loading = true;
            await this.$axios.get(`/api/comissions-assigned/${this.service_control_id}`)
            .then(res => {
                this.comissions = res.data;
                this.used_loading = false;
            })
        },

        async getUsers(){
            await this.$axios.get('/api/responsables')
            .then(res => {
                this.users = res.data;
            })
        },

        ApplyComissioner(){
            if(!this.apply_comissioner){
                this.apply_comissioner = '';
                this.comission_percent = 0;
            }
        },

        selectComission(index){
            const comi = this.comissions_available[index];
            this.selected_comi = index;
            this.comission_type = comi.type;
            this.comission_percent = comi.percent;
            this.ammount = comi.available;
            this.available_id = comi.id;
            this.ready = comi.ready;
            this.available = comi.available;
            this.available_percent = comi.percent;
        },

        calculateAmmount(){
            if(!this.comission_percent){
                this.ammount = 0;
            }
            else if(this.available_percent < this.comission_percent || this.comission_percent <= 0){
                this.ammount = 0;
            }
            else{
                this.ammount = Math.round(this.comission_percent * this.available /this.available_percent);
            }
        },

        calculatePercent(){
            if(!this.ammount){
                this.comission_percent = 0;
            }
            else if(this.available < this.ammount || this.ammount <= 0){
                this.comission_percent = 0;
            }
            else{
                this.comission_percent = Math.round(this.ammount * this.available_percent /this.available);
            }
        },

        Save(){
            this.loading = true;
            if(this.apply_comissioner && this.comissioner_id == this.user_id){
                let text = 'No pueden ser los mismos usuarios el del 20% y el de la comisión normal.';
                this.errors.user_id = text;
                this.errors.comissioner_id = text;
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'NO se pudo guardar la comisión, revise los errores en el formulario.';
                this.timeout = 2000;
                this.loading = false;
            }
            else if(this.ammount > this.available){
                this.errors.ammount = 'El monto no puede ser mayor al monto disponible: '+this.available;
                this.snackbar = true;
                this.snackColor = 'error';
                this.snackText = 'NO se pudo guardar la comisión, revise los errores en el formulario.';
                this.timeout = 2000;
                this.loading = false;
            }
            else{
                this.SaveData();
            }
        },

        SaveData(){
            if(this.comission_id){
                
            }
            else{
                this.$axios.post('/api/comission/store', {user_id:this.user_id, comission_type:this.comission_type, comission_percent:this.comission_percent, ammount:this.ammount, comments:this.comments, comissioner_id:this.comissioner_id, apply_comissioner:this.apply_comissioner, services_control_id:this.service_control_id, comission_id:this.available_id, ready:this.ready})
                .then(res => {
                    this.getUsedComis();
                    this.getComis();
                    this.clearData();
                    this.snackbar = true;
                    this.snackColor = 'success';
                    this.snackText = 'Se guardó la comisión.';
                    this.timeout = 2000;
                    this.loading = false;
                })
                .catch(error => {
                    this.errors = error.response.data.errors;
                    this.snackbar = true;
                    this.snackColor = 'error';
                    this.snackText = 'No se pudo guardar la comisión, revise los errores en el formulario.';
                    this.timeout = 2000;
                    this.loading = false;
                })
            }
        },

        Cancel(){
            this.clearData();
        },

        formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},
    }
}
</script>