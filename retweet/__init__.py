from flask import Flask #, Blueprint
# from flask_restx import Api
# import cx_Oracle


# from pydep import config


def create_app():

    app = Flask(__name__, template_folder="templates",
        static_folder="static")
    # apiBlueprint = Blueprint(
    #     "api",
    #     __name__,
    #     template_folder="templates",
    #     static_folder="static",
    #     static_url_path="",
    # )
    # api = Api(apiBlueprint, doc="/doc", title="Reservist Data Import API")
    # app.register_blueprint(apiBlueprint)

    # dnsStr = cx_Oracle.makedsn(
    #     config.DB_HOST, config.DB_PORT, service_name=config.DB_NAME
    # )

    # app.config[
    #     "SQLALCHEMY_DATABASE_URI"
    # ] = f"oracle://{config.DB_USER}:{config.DB_PASS}@{dnsStr}"
    # app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # app.config["SQLALCHEMY_ECHO"] = True
    # app.config["PROPAGATE_EXCEPTIONS"] = True

    return (app) #, api)
