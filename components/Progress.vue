<template>
    <div>
        <v-navigation-drawer
            v-model="rightDrawer"
            right
            temporary
            fixed
			width="550"
            >
            <v-list>
                <v-list-item>
                    <v-list-item-action>
                        <v-icon @click="clearClose" light>close</v-icon>
                    </v-list-item-action>
                    <v-list-item-title>{{customer}}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title>{{service}}</v-list-item-title>
                </v-list-item>
            </v-list>
            <v-list v-if="progress.length == 0">
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title>El servicio no tiene proceso</v-list-item-title>
                        <v-list-item-subtitle><v-btn block color="green" dark @click="GenerateProcess" :loading="loading_generate">Generar Proceso</v-btn></v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-list v-if="asign_cost == 1">
                <v-list-item>
                    <v-list-item-action>
                        <v-checkbox v-model="manage_cost" color="orange" :disabled="payed_cost == 1" @change="ManageCost"></v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Gestionar pago de derechos: {{formatPrice(cost)}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list v-for="(prog, index) in progress" :key="index">
                <v-list-item>
                    <v-list-item-action>
                        <v-checkbox v-if="prog.admin == 1" v-model="prog.status" color="primary" :disabled="!is_payed || loading_check" @change="Check(index)"></v-checkbox>
                        <v-checkbox v-if="prog.admin == 2" v-model="prog.status" color="primary" :disabled="payed_cost == 0 || loading_check" @change="Check(index)"></v-checkbox>
                        <v-checkbox v-if="prog.admin == 0" v-model="prog.status" color="primary" :disabled="loading_check" @change="Check(index)"></v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{prog.requisite}}</v-list-item-title>
                        <v-list-item-subtitle v-if="prog.status == 1">{{prog.created_at}} - {{prog.name}} {{prog.last_name}}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>
export default {
    data(){
        return {
            rightDrawer:false,
            loading_generate:false,
            loading_check:false,
            service:'',
            progress:[],
            service_id:'',
            services_catalog_id:'',
            customer:'',
            asign_cost:0,
            manage_cost:0,
            payed_cost:0,
            cost:0,
            is_payed:0,
            advance:0,
            advance_total:0,
        }
    },

    methods:{
        openProgress(id){
            this.rightDrawer = true;
            this.service_id = id;
            this.getServicesProgress();
        },

        async getServicesProgress(){
            await this.$axios.get(`/api/binnacles/service/${this.service_id}`)
            .then(res => {
                if(res.data.service.class){
                    this.service =  '('+res.data.service.id+') '+res.data.service.code+' - '+res.data.service.brand+' '+res.data.service.class;
                }
                else{
                    this.service = '('+res.data.service.id+') '+res.data.service.code+' - '+res.data.service.brand;
                }
                this.customer = res.data.service.customer;
                this.asign_cost = res.data.service.asign_cost;
                this.manage_cost = res.data.service.manage_cost;
                this.payed_cost = res.data.service.payed_cost;
                this.cost = res.data.service.cost;
                this.advance = res.data.service.advance;
                this.advance_total = res.data.service.advance_total;
                this.services_catalog_id = res.data.service.services_catalog_id;
                this.is_payed = res.data.service.is_payed;
                this.progress = res.data.progress;
            })
        },

        clearClose(){
            this.Clear();
            this.rightDrawer = false;
        },

        Clear(){

        },

        async ManageCost(){
            await this.$axios.put(`/api/binnacles/manage-cost/${this.service_id}`, {manage_cost:this.manage_cost})
            .then(res => {
                this.manage_cost = res.data.manage_cost * 1;
                this.cost = res.data.cost;
            })
            .catch(error => {
                this.manage_cost = !this.manage_cost;
            })
        },

        async Check(index){
            this.loading_check = true;
            const check = this.progress[index];

            await this.$axios.put(`/api/binnacles/check-list/${check.id}`, {status:check.status, sales:check.sales, operations:check.operations, management:check.management, register:check.register, service_control_id:this.service_id, advance:this.advance, advance_total:this.advance_total})
            .then(res => {
                this.progress[index].created_at = res.data.progress.original.created_at;
                this.progress[index].name = res.data.progress.original.name;
                this.progress[index].last_name = res.data.progress.original.last_name;
                this.advance = res.data.service.original.advance;
                this.$emit('updateProgress', res.data.service.original);
                this.loading_check = false;
            })
            .catch(error => {
                console.log(error);
                this.loading_check = false;
            })
        },

        async GenerateProcess(){
            this.loading_generate = true;
            await this.$axios.post('/api/binnacles/generate-process', {id:this.service_id, services_catalog_id:this.services_catalog_id})
            .then(res => {
                this.progress = res.data;
                this.loading_generate = false;
            })
            .catch(error => {
                console.log(error);
                this.loading_generate = false;
            })
        },

        formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},
    }
}
</script>