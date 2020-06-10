import os
from flask_sqlalchemy import SQLAlchemy 
from flask import Flask, jsonify, render_template, request
import sqlalchemy
from sqlalchemy import create_engine, func
from sqlalchemy.orm import Session
from sqlalchemy.ext.automap import automap_base

# Database setup
engine = create_engine("sqlite:///StatesDB7.sqlite?check_same_thread=False", pool_pre_ping=True)

# Reflect database into new model
Base = automap_base()
Base.prepare(engine, reflect=True)

# Save references to the tables
States = Base.classes.StateDBtable

# Create an app with a name
app = Flask(__name__)

# Create session link
session = Session(engine)

@app.route("/")
def home():
    return render_template("index.html")

# Set up page for state-level election data
@app.route("/state")
def state():
    state_data = []

    for row in session.query(States.Var1, States.year, States.state, States.winner, States.winner_party, States.totalvotes, States.Eligible_voting_pop, States.electoralvotes, States.winner_votes, States.winner_votes_percent, States.margin, States.second, States.second_party, States.second_votes, States.second_votes_percent).all():
        state_data.append(row)
        
    return jsonify(state_data)

    session.close()

# Set up page for year-level election data
engine2 = create_engine("sqlite:///YearDB1.sqlite?check_same_thread=False", pool_pre_ping=True)
Base2 = automap_base()
Base2.prepare(engine2, reflect=True)
Year = Base2.classes.YearDBtable
session2 = Session(engine2)

@app.route("/year")
def year():
    year_data = []

    for row in session2.query(Year.Var1, Year.year, Year.winner, Year.winner_votes, Year.winner_electoral, Year.second, Year.second_votes, Year.second_electoral, Year.third, Year.third_votes, Year.third_electoral).all():
        year_data.append(row)
        
    return jsonify(year_data)

    session2.close()

# Set up page for turnout data
engine3 = create_engine("sqlite:///TurnoutDB1.sqlite?check_same_thread=False", pool_pre_ping=True)
Base3 = automap_base()
Base3.prepare(engine3, reflect=True)
Turnout = Base3.classes.TurnoutDBtable
session3 = Session(engine3)

@app.route("/turnout")
def turnout():
    turnout_data = []

    for row in session3.query(Turnout.Var1, Turnout.year, Turnout.total_voted, Turnout.eligible_votes, Turnout.percent_voted).all():
        turnout_data.append(row)
        
    return jsonify(turnout_data)

    session3.close()

if __name__ == '__main__':
    app.run(debug = True)