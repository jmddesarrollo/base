import ControlException from '../../utils/controlException';

const db = require("../../models");

const Users = db.users;

const { Op } = require("sequelize");

export default class UsersDAL {

    constructor(){}
    
    /**
     * Consulta de todos los usuarios
     */    
    public getUsers() { 
        const users = Users.findAll({raw: true, order: [['username', 'ASC']]})
                        .catch(() => { throw new ControlException('Ha ocurrido un error al buscar los usuarios', 500); });
        
        return users;
    }

    /**
     * Consulta de un usuario
     */    
    public getUser(id: number) {
        const user = Users.findOne({where: {id} })
                        .catch(() => { throw new ControlException('Ha ocurrido un error al buscar el usuario', 500); });
        return user;
    }

    /**
     * Consulta de un usuario por su nombre de usuario o email
     */    
    public getUserByNameOrEmail(nameOrEmail: string) {
        const user = Users.findOne({where: { [Op.or]: [{ username: nameOrEmail }, { email: nameOrEmail }] }})
                        .catch(() => { throw new ControlException('Ha ocurrido un error al buscar el usuario', 500); });
        return user;
    }

    /**
     * Alta de un usuario
     */
    public addUser(user: any, t: any) {
        const userDb = Users.create(user, { transaction: t })
                        .catch((err: any) => {
                            if (err && err.errors[0]) {
                                if (err.errors[0].path === 'user_UNIQUE') throw new ControlException('El nombre de usuario ya existe para otro usuario', 500);
                                if (err.errors[0].path === 'email_UNIQUE') throw new ControlException('El email ya existe para otro usuario', 500);
                                
                                if (err.errors[0].message) throw new ControlException(err.errors[0].message, 500);       
                            }
                            
                            throw new ControlException('Ha ocurrido un error al crear el usuario', 500); });
    
        return userDb;
    }

    /**
     * Editar un usuario
     */
    public editUser(user: any, t: any) {
        const userDB = user.save({ transaction: t })
                    .catch((err: any) => {
                        if (err && err.errors[0]) {
                            if (err.errors[0].path === 'user_UNIQUE') throw new ControlException('El nombre de usuario ya existe para otro usuario', 500);
                            if (err.errors[0].path === 'email_UNIQUE') throw new ControlException('El email ya existe para otro usuario', 500);
                            
                            if (err.errors[0].message) throw new ControlException(err.errors[0].message, 500);       
                        }                  
                       
                        throw new ControlException('Ha ocurrido un error al editar el usuario', 500); 
                    });

        return userDB;
    }

    /**
     * Eliminación de un usuario
     */
    public delUser(userId: number, t: any) {
        const userDB = Users.destroy({ where: { id: userId } , transaction: t})
                        .catch((err:any) => {
                            if (err.index && err.index === 'fk_license_codes_users1') throw new ControlException('No se permite eliminar el usuario porque ha generado códigos de licencias', 500);
                            if (err.index && err.index === 'fk_licenses_users1_idx') throw new ControlException('No se permite eliminar el usuario porque ha generado licencias', 500);
                            
                            throw new ControlException('Ha ocurrido un error al eliminar el usuario', 500); 
                        }); 
    
        return userDB;
    }

    /**
     * Guarda el hash del token de recuperación y su timestamp en BD.
     * Requisitos 5.2, 5.5: invalida cualquier token anterior al sobrescribirlo.
     */
    public async saveRecoveryToken(userId: number, tokenHash: string, createdAt: Date): Promise<void> {
        await Users.update(
            { recovery_token_hash: tokenHash, recovery_token_created_at: createdAt },
            { where: { id: userId } }
        ).catch(() => {
            throw new ControlException('Ha ocurrido un error al guardar el token de recuperación', 500);
        });
    }

    /**
     * Limpia el hash y el timestamp del token de recuperación en BD.
     * Requisitos 5.4: invalida el token tras el cambio de contraseña.
     */
    public async clearRecoveryToken(userId: number): Promise<void> {
        await Users.update(
            { recovery_token_hash: null, recovery_token_created_at: null },
            { where: { id: userId } }
        ).catch(() => {
            throw new ControlException('Ha ocurrido un error al limpiar el token de recuperación', 500);
        });
    }

    /**
     * Obtiene el hash y el timestamp del token de recuperación activo para un usuario.
     * Requisitos 5.3: permite verificar el token almacenado.
     */
    public async getRecoveryTokenData(userId: number): Promise<{ hash: string | null; createdAt: Date | null }> {
        const user = await Users.findOne({
            where: { id: userId },
            attributes: ['recovery_token_hash', 'recovery_token_created_at'],
            raw: true,
        }).catch(() => {
            throw new ControlException('Ha ocurrido un error al obtener el token de recuperación', 500);
        });

        if (!user) {
            throw new ControlException('Usuario no encontrado', 404);
        }

        return {
            hash: user.recovery_token_hash ?? null,
            createdAt: user.recovery_token_created_at ? new Date(user.recovery_token_created_at) : null,
        };
    }
}